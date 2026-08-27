import { describe, expect, it } from "vitest";

describe("Descope project configuration", () => {
  it("reaches the Descope public API with the configured project identifier", async () => {
    const projectId = process.env.VITE_DESCOPE_PROJECT_ID;
    expect(projectId).toBe("P3IVwF6aVoQV6pz8syilausCiMYy");

    const response = await fetch(`https://api.descope.com/v1/health?projectId=${encodeURIComponent(projectId)}`, {
      method: "GET",
      headers: { "x-descope-project-id": projectId },
    });

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
  }, 15_000);
});
