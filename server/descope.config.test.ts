import { describe, expect, it } from "vitest";

// Configuration probe, not a unit test: it validates a live provider setup. A clean
// checkout has no VITE_DESCOPE_PROJECT_ID, so the probe skips instead of failing the
// suite. Authentication is provided by the EduPulse password session; the Descope
// flow stays opt-in per docs/descope-integration-notes.md.
const projectId = process.env.VITE_DESCOPE_PROJECT_ID?.trim() ?? "";
const skipProbe = projectId ? undefined : it.skip;

describe("Descope project configuration", () => {
  (skipProbe ?? it)("reaches the Descope public API with the configured project identifier", async () => {
    expect(projectId).toBeTruthy();

    const response = await fetch(`https://api.descope.com/v1/health?projectId=${encodeURIComponent(projectId)}`, {
      method: "GET",
      headers: { "x-descope-project-id": projectId },
    });

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
  }, 15_000);
});
