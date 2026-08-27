import { assertSafePublicUrl, chunkText } from "./policy";

/**
 * Stable hand-off between EduPulse and an isolated Crawl4AI worker.
 * Crawling stays server-side and administrator-controlled; it never runs in the
 * browser and never receives private student or guardian records.
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

function crawl4aiEndpoint() {
  return (process.env.CRAWL4AI_API_URL || "").trim().replace(/\/+$/, "");
}

/**
 * Calls a self-hosted Crawl4AI Docker/API worker when configured. Returning
 * null means the optional worker is not configured; callers may use the safe
 * HTML importer fallback. The response is treated as untrusted data.
 */
export async function crawlPublicPageWithCrawl4AI(url: string) {
  const endpoint = crawl4aiEndpoint();
  if (!endpoint) return null;
  const safeUrl = assertSafePublicUrl(url).toString();
  const token = (process.env.CRAWL4AI_API_TOKEN || "").trim();
  const response = await fetch(`${endpoint}/crawl`, {
    method: "POST",
    signal: AbortSignal.timeout(15_000),
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ urls: [safeUrl], priority: 5 }),
  });
  if (!response.ok) throw new Error(`Crawl4AI returned HTTP ${response.status}.`);
  const payload = await response.json() as { results?: Array<{ url?: string; markdown?: string; title?: string }> };
  const item = payload.results?.[0];
  if (!item?.markdown || item.markdown.length < 120) throw new Error("Crawl4AI returned no readable page content.");
  const canonicalUrl = assertSafePublicUrl(item.url || safeUrl).toString();
  return { title: (item.title || canonicalUrl).slice(0, 255), sourceUrl: canonicalUrl, text: item.markdown.slice(0, 750_000) };
}
