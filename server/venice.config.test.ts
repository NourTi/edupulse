import { describe, expect, it } from "vitest";

describe("Venice configuration", () => {
  it("accepts the configured server-side key at the lightweight models endpoint", async () => {
    const key = process.env.VENICE_INFERENCE_API_KEY;
    if (!key) throw new Error("VENICE_INFERENCE_API_KEY is not configured for this validation.");
    const response = await fetch("https://api.venice.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8_000),
    });
    expect(response.ok).toBe(true);
    const body = await response.json() as { data?: unknown };
    expect(Array.isArray(body.data)).toBe(true);
  }, 12_000);
});
