import { describe, expect, it } from "vitest";
import { hashOpaqueToken, hashPassword, normalizeEmail, validatePassword, verifyPassword } from "./auth/password";

describe("EduPulse password authentication", () => {
  it("normalizes email addresses before lookup", () => {
    expect(normalizeEmail("  Teacher@School.EDU ")).toBe("teacher@school.edu");
  });

  it("rejects weak passwords and verifies strong password hashes", async () => {
    expect(() => validatePassword("short")).toThrow();
    expect(() => validatePassword("alllowercase123")).toThrow();
    const hash = await hashPassword("SecurePass123");
    expect(await verifyPassword("SecurePass123", hash)).toBe(true);
    expect(await verifyPassword("WrongPass123", hash)).toBe(false);
  });

  it("hashes invitation tokens deterministically without storing the raw token", () => {
    const token = "invite-token-example-123";
    expect(hashOpaqueToken(token)).toHaveLength(64);
    expect(hashOpaqueToken(token)).toBe(hashOpaqueToken(token));
    expect(hashOpaqueToken(token)).not.toBe(token);
  });
});
