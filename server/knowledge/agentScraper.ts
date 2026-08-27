import type { RetrievedChunk } from "./policy";
import { assertSafePublicUrl } from "./policy";

const DEFAULT_BASE_URL = "https://agent-scraper-mcp.onrender.com/api/v1";
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_RESULTS = 3;
const MAX_CONTENT_CHARS = 6_000;

function baseUrl() {
  return (process.env.AGENT_SCRAPER_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

async function postJson(path: string, body: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`Agent Scraper returned non-JSON HTTP ${response.status}`);
    }
    if (!response.ok) throw new Error(`Agent Scraper HTTP ${response.status}`);
    return payload as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

function sourceId(url: string) {
  return `agent_scraper_${encodeURIComponent(url).replace(/%/g, "").slice(0, 80)}`;
}

function resultList(payload: Record<string, unknown>) {
  const candidates = Array.isArray(payload.results) ? payload.results : Array.isArray(payload.data) ? payload.data : [];
  return candidates.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
}

export async function searchAndFetchPublicWeb(question: string, language: "ar" | "en"): Promise<RetrievedChunk[]> {
  const query = language === "ar" ? `${question} معلومات عامة` : question;
  const search = await postJson("/search_google", { query, num_results: MAX_RESULTS });
  const searchResults = resultList(search).slice(0, MAX_RESULTS);
  const urls = searchResults
    .map(item => typeof item.url === "string" ? item.url : typeof item.link === "string" ? item.link : "")
    .filter(Boolean);

  const fetched = await Promise.allSettled(urls.map(async url => {
    const safeUrl = assertSafePublicUrl(url).toString();
    const page = await postJson("/scrape_url", { url: safeUrl, format: "markdown" });
    const content = typeof page.content === "string" ? page.content.trim().slice(0, MAX_CONTENT_CHARS) : "";
    const title = typeof page.title === "string" && page.title.trim() ? page.title.trim().slice(0, 240) : safeUrl;
    if (!content) return null;
    return { id: `chunk_${sourceId(safeUrl)}`, sourceId: sourceId(safeUrl), title, sourceUrl: safeUrl, content } satisfies RetrievedChunk;
  }));

  return fetched.flatMap(result => result.status === "fulfilled" && result.value ? [result.value] : []);
}
