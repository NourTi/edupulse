import { assertSafePublicUrl, chunkText } from "./policy";

/**
 * Stable hand-off between EduPulse and a future isolated Crawl4AI worker.
 * The worker is deliberately separate from the web app: crawling and document
 * parsing can be resource-intensive and must never run in the browser.
 */
export type Crawl4AIJob = {
  jobVersion: 1;
  sourceId: string;
  url: string;
  visibility: "public" | "staff";
  requestedAt: string;
  requestedById: number;
};

export type Crawl4AIResult = {
  sourceId: string;
  canonicalUrl: string;
  title: string;
  readableText: string;
  status: "ready" | "failed";
  error?: string;
};

export function createCrawl4AIJob(input: { sourceId: string; url: string; visibility: "public" | "staff"; requestedById: number }): Crawl4AIJob {
  const safeUrl = assertSafePublicUrl(input.url);
  return {
    jobVersion: 1,
    sourceId: input.sourceId,
    url: safeUrl.toString(),
    visibility: input.visibility,
    requestedAt: new Date().toISOString(),
    requestedById: input.requestedById,
  };
}

export function normalizeCrawl4AIResult(result: Crawl4AIResult) {
  const canonicalUrl = assertSafePublicUrl(result.canonicalUrl).toString();
  if (result.status === "failed") return { status: "failed" as const, error: result.error || "Crawler worker reported a failure.", canonicalUrl, chunks: [] as string[] };
  const chunks = chunkText(result.readableText);
  if (!chunks.length) return { status: "failed" as const, error: "Crawler worker returned no readable text.", canonicalUrl, chunks: [] as string[] };
  return { status: "ready" as const, canonicalUrl, chunks };
}
