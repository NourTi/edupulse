import { afterEach, describe, expect, it, vi } from "vitest";
import { createCrawl4AIJob, crawlPublicPageWithCrawl4AI, normalizeCrawl4AIResult } from "./crawl4aiGateway";

describe("Crawl4AI gateway contract", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("creates jobs only for safe approved public URLs", () => {
    const job = createCrawl4AIJob({ sourceId: "ks_demo", url: "https://school.example/handbook", visibility: "public", requestedById: 1 });
    expect(job.url).toBe("https://school.example/handbook");
    expect(() => createCrawl4AIJob({ sourceId: "ks_demo", url: "http://localhost:3000/private", visibility: "public", requestedById: 1 })).toThrow();
  });

  it("stays optional when no Crawl4AI endpoint is configured", async () => {
    vi.stubEnv("CRAWL4AI_API_URL", "");
    await expect(crawlPublicPageWithCrawl4AI("https://school.example/handbook")).resolves.toBeNull();
  });

  it("turns only readable crawler output into citation-ready chunks", () => {
    const ready = normalizeCrawl4AIResult({ sourceId: "ks_demo", canonicalUrl: "https://school.example/handbook", title: "Handbook", readableText: "Attendance begins at 08:00. Families receive notice before policy changes.", status: "ready" });
    expect(ready.status).toBe("ready");
    expect(ready.chunks[0]).toContain("Attendance");
    const failed = normalizeCrawl4AIResult({ sourceId: "ks_demo", canonicalUrl: "https://school.example/handbook", title: "Handbook", readableText: "", status: "failed", error: "timeout" });
    expect(failed.status).toBe("failed");
  });
});
