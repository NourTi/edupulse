import { describe, expect, it } from "vitest";
import { getMedusaStatus, listMedusaProducts } from "./medusa";

describe("Medusa commerce adapter", () => {
  it("reports an unconfigured integration without exposing secrets", () => {
    const status = getMedusaStatus();
    expect(status).toMatchObject({ configured: false, backendUrl: null, hasPublishableKey: false, hasAdminToken: false });
    expect(JSON.stringify(status)).not.toContain("Bearer");
  });

  it("does not make a network request when Medusa is not configured", async () => {
    await expect(listMedusaProducts()).resolves.toEqual([]);
  });
});
