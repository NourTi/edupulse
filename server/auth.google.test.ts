import { describe, expect, it } from "vitest";
import { addGoogleState, consumeGoogleState } from "./auth/google";

describe("Google OAuth state handling", () => {
  it("keeps several login tabs valid without allowing an unbounded cookie", () => {
    const states = Array.from({ length: 7 }, (_, index) => addGoogleState(undefined, `state-${index}`)).at(-1);
    expect(states).toEqual(["state-6"]);

    let cookie: string | undefined;
    for (let index = 0; index < 7; index += 1) cookie = addGoogleState(cookie, `state-${index}`).join(".");
    expect(cookie?.split(".")).toEqual(["state-2", "state-3", "state-4", "state-5", "state-6"]);
  });

  it("consumes only the matching state and preserves other tabs", () => {
    const result = consumeGoogleState("first.second.third", "second");
    expect(result.valid).toBe(true);
    expect(result.remaining).toEqual(["first", "third"]);

    const replay = consumeGoogleState(result.remaining.join("."), "second");
    expect(replay.valid).toBe(false);
  });

  it("rejects a missing or modified state", () => {
    expect(consumeGoogleState("abc123", "abc124").valid).toBe(false);
    expect(consumeGoogleState(undefined, "abc123").valid).toBe(false);
  });
});

describe("Google OAuth configuration", () => {
  it("accepts the configured client credentials at Google's token endpoint", async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    expect(clientId).toMatch(/\.apps\.googleusercontent\.com$/);
    expect(clientSecret).toBeTruthy();

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code: "edupulse-configuration-probe",
        grant_type: "authorization_code",
        redirect_uri: "https://edupulse-krcu.onrender.com/api/auth/google/callback",
      }),
    });
    const payload = await response.json() as { error?: string; error_description?: string };
    expect(response.status).toBe(400);
    expect(payload.error).toBeDefined();
    expect(payload.error).not.toBe("invalid_client");
  });
});
