import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("LLM configuration contract", () => {
  it("fails loudly when no provider credential exists", async () => {
    vi.stubEnv("BUILT_IN_FORGE_API_KEY", "");
    vi.stubEnv("LLM_API_KEY", "");
    vi.stubEnv("BUILT_IN_FORGE_API_URL", "https://example.invalid/v1");
    vi.resetModules();
    const { invokeLLM } = await import("./_core/llm");
    await expect(invokeLLM({ messages: [{ role: "user", content: "hello" }] })).rejects.toThrow("No LLM provider is configured");
  });

  it("uses the configured server-side model endpoint and model", async () => {
    vi.stubEnv("LLM_API_KEY", "test-server-key");
    vi.stubEnv("LLM_API_URL", "https://llm.example.test/v1/chat/completions");
    vi.stubEnv("LLM_MODEL", "test-model");
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({ authorization: "Bearer test-server-key" });
      const payload = JSON.parse(String(init?.body));
      expect(payload.model).toBe("test-model");
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content: "[S1] Answer" } }] }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { invokeLLM } = await import("./_core/llm");
    const result = await invokeLLM({ messages: [{ role: "user", content: "hello" }] });
    expect(result.choices[0]?.message.content).toContain("[S1]");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
