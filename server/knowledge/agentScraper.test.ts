import { afterEach, describe, expect, it, vi } from "vitest";
import { searchAndFetchPublicWeb } from "./agentScraper";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Agent Scraper web retrieval", () => {
  it("turns search results and extracted pages into bounded retrieved chunks", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ url: "https://example.com/article" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ title: "Example article", content: "Public information about the requested topic." }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const chunks = await searchAndFetchPublicWeb("What is a public topic?", "en");

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ sourceId: "agent_scraper_https3A2F2Fexample.com2Farticle", title: "Example article", sourceUrl: "https://example.com/article" });
    expect(chunks[0]?.content).toContain("Public information");
  });

  it("fails closed when the upstream returns non-JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("Database service unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchAndFetchPublicWeb("What is a public topic?", "en")).rejects.toThrow("non-JSON");
  });
});
