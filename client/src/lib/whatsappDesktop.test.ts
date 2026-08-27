import { describe, expect, it } from "vitest";
import { normalizeWhatsAppPhone } from "./whatsappDesktop";

describe("WhatsApp desktop bridge", () => {
  it("normalizes common phone formatting without changing the country code", () => {
    expect(normalizeWhatsAppPhone("+213 555-014-100")).toBe("+213555014100");
  });

  it("rejects malformed or unsafe phone values", () => {
    expect(() => normalizeWhatsAppPhone("+213 555 ABC")).toThrow();
    expect(() => normalizeWhatsAppPhone("123")).toThrow();
  });
});
