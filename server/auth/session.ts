import { EDUPULSE_SESSION_COOKIE } from "@shared/const";
import { nanoid } from "nanoid";
import { createAuthSession, getUserBySessionHash, revokeAuthSession } from "../db";
import { createOpaqueToken, hashOpaqueToken } from "./password";

const SESSION_DAYS = 30;

function cookieOptions(req: { protocol?: string; headers?: Record<string, unknown> }) {
  const forwarded = req.headers?.["x-forwarded-proto"];
  const isSecure = req.protocol === "https" || forwarded === "https";
  return {
    httpOnly: true,
    secure: Boolean(isSecure),
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
}

export async function establishPasswordSession(userId: number, req: { headers?: Record<string, unknown> }) {
  const rawToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await createAuthSession({
    id: `sess_${nanoid(16)}`,
    userId,
    tokenHash: hashOpaqueToken(rawToken),
    expiresAt,
    userAgent: typeof req.headers?.["user-agent"] === "string" ? req.headers["user-agent"] : null,
  });
  return rawToken;
}

export async function userFromPasswordSession(req: { headers: { cookie?: string } }) {
  const cookie = req.headers.cookie ?? "";
  const match = cookie.split(";").map(value => value.trim()).find(value => value.startsWith(`${EDUPULSE_SESSION_COOKIE}=`));
  const rawToken = match?.slice(`${EDUPULSE_SESSION_COOKIE}=`.length);
  if (!rawToken) return undefined;
  return getUserBySessionHash(hashOpaqueToken(rawToken));
}

export async function clearPasswordSession(req: { headers: { cookie?: string } }) {
  const cookie = req.headers.cookie ?? "";
  const match = cookie.split(";").map(value => value.trim()).find(value => value.startsWith(`${EDUPULSE_SESSION_COOKIE}=`));
  const rawToken = match?.slice(`${EDUPULSE_SESSION_COOKIE}=`.length);
  if (rawToken) await revokeAuthSession(hashOpaqueToken(rawToken));
}

export function setPasswordSessionCookie(res: { cookie: (name: string, value: string, options: ReturnType<typeof cookieOptions>) => void }, req: { protocol?: string; headers?: Record<string, unknown> }, rawToken: string) {
  res.cookie(EDUPULSE_SESSION_COOKIE, rawToken, cookieOptions(req));
}

export function clearPasswordSessionCookie(res: { clearCookie: (name: string, options: ReturnType<typeof cookieOptions>) => void }, req: { protocol?: string; headers?: Record<string, unknown> }) {
  res.clearCookie(EDUPULSE_SESSION_COOKIE, { ...cookieOptions(req), maxAge: 0 });
}
