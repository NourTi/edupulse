import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

const PASSWORD_ROUNDS = 12;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string) {
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Password must include uppercase, lowercase, and a number.");
  }
}

export async function hashPassword(password: string) {
  validatePassword(password);
  return bcrypt.hash(password, PASSWORD_ROUNDS);
}

export async function verifyPassword(password: string, hash: string | null) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
