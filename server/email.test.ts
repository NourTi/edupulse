import { afterEach, describe, expect, it, vi } from "vitest";
import { sendPasswordResetEmail } from "./email";

describe("sendPasswordResetEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("fails clearly when Resend credentials or a verified sender are missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("RESEND_FROM_EMAIL", "");

    await expect(sendPasswordResetEmail({ to: "parent@example.com", token: "reset-token" })).rejects.toThrow("RESEND_API_KEY and RESEND_FROM_EMAIL");
  });

  it("sends a reset link through the configured Resend sender", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "noreply@school.example");
    vi.stubEnv("APP_BASE_URL", "https://edupulse.example");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "email_1" }), { status: 200, headers: { "content-type": "application/json" } }));

    await sendPasswordResetEmail({ to: "parent@example.com", token: "reset-token-123" });

    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({ method: "POST" }));
    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.headers).toMatchObject({ Authorization: "Bearer test-key" });
    const body = JSON.parse(String(request?.body));
    expect(body.from).toBe("noreply@school.example");
    expect(body.to).toEqual(["parent@example.com"]);
    expect(body.html).toContain("https://edupulse.example/?reset=reset-token-123");
  });
});
