import crypto from "node:crypto";
import type { Express, Request } from "express";
import { nanoid } from "nanoid";
import { parse } from "cookie";
import { createExternalUser, createUserAuthAccount, getUserAuthAccount, getUserByEmail } from "../db";
import { establishPasswordSession, setPasswordSessionCookie } from "./session";

const STATE_COOKIE = "edupulse_google_state";
const ORIGIN_COOKIE = "edupulse_google_origin";
const MAX_PENDING_STATES = 5;
const GOOGLE_AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

type GoogleStateResult = { valid: boolean; remaining: string[] };

function appBaseUrl(req: Request) {
  return (process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

export function normalizeOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    if (url.protocol === "http:" && !["localhost", "127.0.0.1"].includes(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function requestedOrigin(req: Request) {
  const queryOrigin = typeof req.query.origin === "string" ? normalizeOrigin(req.query.origin) : null;
  return queryOrigin || normalizeOrigin(process.env.APP_BASE_URL) || appBaseUrl(req);
}

function callbackUrl(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

function configured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

function cookieSecure(req: Request) {
  return req.secure || req.headers["x-forwarded-proto"] === "https";
}

function constantTimeEqual(left: string, right: string) {
  if (!left || left.length !== right.length) return false;
  return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

/**
 * Google can leave several login tabs open. Store a bounded list rather than
 * one state so a second tab cannot invalidate the first tab's callback.
 */
export function addGoogleState(cookieValue: string | undefined, state: string) {
  const states = (cookieValue || "").split(".").filter(Boolean).filter(item => item !== state);
  return [...states, state].slice(-MAX_PENDING_STATES);
}

/** Remove only the state that was actually presented by Google. */
export function consumeGoogleState(cookieValue: string | undefined, state: string): GoogleStateResult {
  const states = (cookieValue || "").split(".").filter(Boolean);
  const index = states.findIndex(candidate => constantTimeEqual(candidate, state));
  if (index < 0) return { valid: false, remaining: states };
  return { valid: true, remaining: states.filter((_, candidateIndex) => candidateIndex !== index) };
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isDatabaseMigrationError(error: unknown) {
  return /ER_NO_SUCH_TABLE|unknown table|doesn't exist|does not exist/i.test(errorText(error));
}

function restartMessage(message: string, reference: string) {
  return `${message}\n\nStart again: /api/auth/google\nReference: ${reference}`;
}

export function registerGoogleRoutes(app: Express) {
  app.get("/api/auth/google", (req, res) => {
    if (!configured()) return res.status(503).send("Google sign-in is not configured.");
    const state = crypto.randomBytes(24).toString("hex");
    const origin = requestedOrigin(req);
    const previousState = parse(req.headers.cookie || "")[STATE_COOKIE];
    const pendingStates = addGoogleState(previousState, state);
    const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: cookieSecure(req), maxAge: 10 * 60 * 1000, path: "/" };
    res.cookie(STATE_COOKIE, pendingStates.join("."), cookieOptions);
    res.cookie(ORIGIN_COOKIE, origin, cookieOptions);
    const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: callbackUrl(origin), response_type: "code", scope: "openid email profile", state, access_type: "online", prompt: "select_account" });
    return res.redirect(`${GOOGLE_AUTHORIZE}?${params.toString()}`);
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    if (!configured()) return res.status(503).send("Google sign-in is not configured.");
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const savedCookies = parse(req.headers.cookie || "");
    const savedOrigin = normalizeOrigin(savedCookies[ORIGIN_COOKIE]) || normalizeOrigin(process.env.APP_BASE_URL) || appBaseUrl(req);
    const savedState = savedCookies[STATE_COOKIE];
    const stateResult = consumeGoogleState(savedState, state);
    if (!state || !stateResult.valid) return res.status(400).send(restartMessage("Invalid Google sign-in state.", "state_mismatch"));
    if (stateResult.remaining.length) {
      res.cookie(STATE_COOKIE, stateResult.remaining.join("."), { httpOnly: true, sameSite: "lax", secure: cookieSecure(req), maxAge: 10 * 60 * 1000, path: "/" });
    } else {
      res.clearCookie(STATE_COOKIE, { httpOnly: true, sameSite: "lax", secure: cookieSecure(req), path: "/" });
    }
    res.clearCookie(ORIGIN_COOKIE, { httpOnly: true, sameSite: "lax", secure: cookieSecure(req), path: "/" });
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) return res.status(400).send(restartMessage("Google sign-in was cancelled or failed.", "missing_code"));

    const reference = `google_${nanoid(8)}`;
    try {
      const tokenResponse = await fetch(GOOGLE_TOKEN, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: callbackUrl(savedOrigin), grant_type: "authorization_code" }) });
      const token = await tokenResponse.json() as { access_token?: string };
      if (!tokenResponse.ok || !token.access_token) return res.status(401).send(restartMessage("Google sign-in could not be completed.", reference));
      const profileResponse = await fetch(GOOGLE_USERINFO, { headers: { Authorization: `Bearer ${token.access_token}` } });
      const profile = await profileResponse.json() as { sub?: string; email?: string; email_verified?: boolean; name?: string };
      if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) return res.status(401).send(restartMessage("Google did not provide a verified email address.", reference));

      const email = profile.email.trim().toLowerCase();
      const existingIdentity = await getUserAuthAccount("google", profile.sub);
      let user = existingIdentity?.user;
      if (!user) user = await getUserByEmail(email);
      if (!user) user = await createExternalUser({ name: profile.name || email, email });
      if (!user || user.status !== "active") return res.status(403).send("This EduPulse account is not active.");
      if (!existingIdentity) await createUserAuthAccount({ id: `oauth_${nanoid(16)}`, userId: user.id, provider: "google", providerAccountId: profile.sub, providerEmail: email });
      const session = await establishPasswordSession(user.id, req);
      setPasswordSessionCookie(res, req, session);
      return res.redirect("/");
    } catch (error) {
      console.error(`[Auth] Google sign-in failed (${reference})`, error);
      if (isDatabaseMigrationError(error)) return res.status(503).send(restartMessage("Google sign-in needs the latest EduPulse database migration. Ask the administrator to apply the current database migrations, then try again.", reference));
      return res.status(502).send(restartMessage("Google sign-in is temporarily unavailable.", reference));
    }
  });
}
