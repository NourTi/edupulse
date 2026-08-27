import { afterEach, describe, expect, it, vi } from "vitest";
import { invokeVenice, veniceConfigured } from "./ai/venice";

afterEach(() => vi.unstubAllGlobals());

describe("Venice configuration", () => {
  it("uses the configured server-side key through the OpenAI-compatible request contract", async () => {
    expect(typeof veniceConfigured()).toBe("boolean");
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
      expect(_url).toContain("/chat/completions");
      expect((init?.headers as Record<string, string>).authorization).toContain("Bearer ");
      const body = JSON.parse(String(init?.body));
      expect(body.messages[0].role).toBe("system");
      return new Response(JSON.stringify({ choices: [{ message: { content: "ok" }, finish_reason: "stop" }] }), { status: 200, headers: { "content-type": "application/json" } });
    }));
    if (!veniceConfigured()) return;
    const response = await invokeVenice({ messages: [{ role: "system", content: "test" }, { role: "user", content: "hello" }], maxTokens: 20 });
    expect(response.choices?.[0]?.message?.content).toBe("ok");
  });
});
