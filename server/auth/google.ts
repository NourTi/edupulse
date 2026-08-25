import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { parse } from "cookie";
import { createExternalUser, createUserAuthAccount, getUserAuthAccount, getUserByEmail } from "../db";
import { establishPasswordSession, setPasswordSessionCookie } from "./session";

const STATE_COOKIE = "edupulse_google_state";
const GOOGLE_AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

function appBaseUrl(req: Request) {
  return (process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function callbackUrl(req: Request) {
  return `${appBaseUrl(req)}/api/auth/google/callback`;
}

function configured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function registerGoogleRoutes(app: Express) {
  app.get("/api/auth/google", (req, res) => {
    if (!configured()) return res.status(503).send("Google sign-in is not configured.");
    const state = crypto.randomBytes(24).toString("hex");
    res.cookie(STATE_COOKIE, state, { httpOnly: true, sameSite: "lax", secure: req.secure || req.headers["x-forwarded-proto"] === "https", maxAge: 10 * 60 * 1000, path: "/" });
    const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: callbackUrl(req), response_type: "code", scope: "openid email profile", state, access_type: "online", prompt: "select_account" });
    return res.redirect(`${GOOGLE_AUTHORIZE}?${params.toString()}`);
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    if (!configured()) return res.status(503).send("Google sign-in is not configured.");
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const savedState = parse(req.headers.cookie || "")[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE, { httpOnly: true, sameSite: "lax", secure: req.secure || req.headers["x-forwarded-proto"] === "https", path: "/" });
    if (!state || !savedState || state.length !== savedState.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(savedState))) return res.status(400).send("Invalid Google sign-in state.");
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) return res.status(400).send("Google sign-in was cancelled or failed.");

    try {
      const tokenResponse = await fetch(GOOGLE_TOKEN, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: callbackUrl(req), grant_type: "authorization_code" }) });
      const token = await tokenResponse.json() as { access_token?: string };
      if (!tokenResponse.ok || !token.access_token) return res.status(401).send("Google sign-in could not be completed.");
      const profileResponse = await fetch(GOOGLE_USERINFO, { headers: { Authorization: `Bearer ${token.access_token}` } });
      const profile = await profileResponse.json() as { sub?: string; email?: string; email_verified?: boolean; name?: string };
      if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) return res.status(401).send("Google did not provide a verified email address.");

      const existingIdentity = await getUserAuthAccount("google", profile.sub);
      let user = existingIdentity?.user;
      if (!user) user = await getUserByEmail(profile.email.trim().toLowerCase());
      if (!user) user = await createExternalUser({ name: profile.name || profile.email, email: profile.email.trim().toLowerCase() });
      if (!user || user.status !== "active") return res.status(403).send("This EduPulse account is not active.");
      if (!existingIdentity) await createUserAuthAccount({ id: `oauth_${nanoid(16)}`, userId: user.id, provider: "google", providerAccountId: profile.sub, providerEmail: profile.email.trim().toLowerCase() });
      const session = await establishPasswordSession(user.id, req);
      setPasswordSessionCookie(res, req, session);
      return res.redirect("/");
    } catch (error) {
      console.error("[Auth] Google sign-in failed", error);
      return res.status(502).send("Google sign-in is temporarily unavailable.");
    }
  });
}
