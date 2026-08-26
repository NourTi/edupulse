type WikipediaSearchResponse = {
  query?: { search?: Array<{ title?: string }> };
};

type WikipediaSummaryResponse = {
  title?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
};

export type FreeSourceAnswer = {
  title: string;
  extract: string;
  url: string;
};

function wikipediaLanguage(isArabic: boolean) {
  return isArabic ? "ar" : "en";
}

function cleanQuestion(question: string) {
  return question.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
}

export function isLikelyGeneralKnowledgeQuestion(question: string) {
  const normalized = question.toLowerCase().trim();
  return /^(what is|who is|where is|when was|why is|how does|define|explain|ما هو|ما هي|من هو|من هي|أين|متى|لماذا|كيف يعمل|اشرح)/.test(normalized);
}

export async function fetchWikipediaAnswer(question: string, isArabic: boolean): Promise<FreeSourceAnswer | null> {
  const query = cleanQuestion(question);
  if (!query) return null;
  const language = wikipediaLanguage(isArabic);
  const searchUrl = new URL(`https://${language}.wikipedia.org/w/api.php`);
  searchUrl.search = new URLSearchParams({ action: "query", list: "search", srsearch: query, srlimit: "1", format: "json", origin: "*" }).toString();
  const searchResponse = await fetch(searchUrl, { headers: { Accept: "application/json", "User-Agent": "EduPulse/1.0 public-knowledge" } });
  if (!searchResponse.ok) return null;
  const search = (await searchResponse.json()) as WikipediaSearchResponse;
  const title = search.query?.search?.[0]?.title?.trim();
  if (!title) return null;

  const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  const summaryResponse = await fetch(summaryUrl, { headers: { Accept: "application/json", "User-Agent": "EduPulse/1.0 public-knowledge" } });
  if (!summaryResponse.ok) return null;
  const summary = (await summaryResponse.json()) as WikipediaSummaryResponse;
  const extract = summary.extract?.replace(/\s+/g, " ").trim();
  const url = summary.content_urls?.desktop?.page;
  if (!extract || !url) return null;
  return { title: summary.title || title, extract, url };
}
