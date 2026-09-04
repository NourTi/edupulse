import DescopeClient from "@descope/node-sdk";
import { nanoid } from "nanoid";
import { createExternalUser, createUserAuthAccount, getUserAuthAccount, getUserByEmail, getUserById } from "../db";
import { ENV } from "../_core/env";
import { establishPasswordSession } from "./session";

let client: ReturnType<typeof DescopeClient> | null = null;

function getDescopeClient() {
  const projectId = ENV.descopeProjectId.trim();
  if (!projectId) throw new Error("Descope is not configured.");
  client ??= DescopeClient({ projectId });
  return client;
}

function tokenValue(token: Record<string, unknown>, key: string) {
  const value = token[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function exchangeDescopeSession(sessionToken: string, req: { headers?: Record<string, unknown> }) {
  const projectId = ENV.descopeProjectId.trim();
  if (!projectId) throw new Error("Descope is not configured.");
  const authInfo = await getDescopeClient().validateSession(sessionToken, { audience: projectId });
  const token = authInfo.token as Record<string, unknown>;
  const providerAccountId = tokenValue(token, "sub");
  const email = tokenValue(token, "email").toLowerCase();
  const name = tokenValue(token, "name") || email;
  if (!providerAccountId || !email) throw new Error("Descope session does not contain a verified identity.");

  let user = (await getUserAuthAccount("descope", providerAccountId))?.user;
  if (!user) {
    user = await getUserByEmail(email);
    if (user && user.status !== "active") throw new Error("This EduPulse account is not active.");
    if (!user) user = await createExternalUser({ name, email, loginMethod: "descope" });
    if (!user) throw new Error("Could not create the EduPulse account.");
    await createUserAuthAccount({ id: `descope_${nanoid(16)}`, userId: user.id, provider: "descope", providerAccountId, providerEmail: email });
  }

  const freshUser = await getUserById(user.id);
  if (!freshUser || freshUser.status !== "active") throw new Error("This EduPulse account is not active.");
  const rawSessionToken = await establishPasswordSession(freshUser.id, req);
  return { user: freshUser, rawSessionToken };
}
