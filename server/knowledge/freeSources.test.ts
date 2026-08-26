import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWikipediaAnswer, isLikelyGeneralKnowledgeQuestion } from "./freeSources";

describe("free public knowledge source", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("recognizes general questions but not school-policy prompts", () => {
    expect(isLikelyGeneralKnowledgeQuestion("What is photosynthesis?")).toBe(true);
    expect(isLikelyGeneralKnowledgeQuestion("ما هي الجزائر؟")).toBe(true);
    expect(isLikelyGeneralKnowledgeQuestion("What are the school opening hours?")).toBe(false);
  });

  it("returns a cited Wikipedia summary without credentials", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ query: { search: [{ title: "Photosynthesis" }] } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ title: "Photosynthesis", extract: "Photosynthesis is a process used by plants.", content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Photosynthesis" } } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchWikipediaAnswer("What is photosynthesis?", false)).resolves.toEqual({ title: "Photosynthesis", extract: "Photosynthesis is a process used by plants.", url: "https://en.wikipedia.org/wiki/Photosynthesis" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
