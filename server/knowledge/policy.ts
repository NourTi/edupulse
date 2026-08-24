export type RetrievedChunk = {
  id: string;
  sourceId: string;
  title: string;
  sourceUrl: string | null;
  content: string;
};

const protectedRecordTerms = [
  "my child", "my son", "my daughter", "student record", "attendance record", "grade", "grades", "fee balance",
  "ابني", "ابنتي", "بنتي", "درجات", "درجة", "الحضور", "سجل الطالب", "رصيد", "الرسوم",
];

export function containsProtectedRecordIntent(question: string) {
  const normalized = question.toLowerCase();
  return protectedRecordTerms.some(term => normalized.includes(term));
}

export function chunkText(raw: string, maxLength = 1100) {
  const clean = raw.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!؟?])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length + 1 > maxLength) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.length ? chunks : [clean.slice(0, maxLength)];
}

function tokens(value: string) {
  return Array.from(new Set(value.toLowerCase().match(/[A-Za-z0-9\u0600-\u06FF]{2,}/g) ?? []));
}

export function retrieveRelevantChunks(question: string, chunks: RetrievedChunk[], limit = 5) {
  const questionTokens = tokens(question);
  if (!questionTokens.length) return [];
  return chunks
    .map(chunk => {
      const haystack = `${chunk.title} ${chunk.content}`.toLowerCase();
      const score = questionTokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
      return { ...chunk, score };
    })
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.content.length - b.content.length)
    .slice(0, limit);
}

export function toSourceReferences(chunks: RetrievedChunk[]) {
  const seen = new Set<string>();
  return chunks.filter(chunk => {
    if (seen.has(chunk.sourceId)) return false;
    seen.add(chunk.sourceId);
    return true;
  }).map(chunk => ({ id: chunk.sourceId, title: chunk.title, url: chunk.sourceUrl }));
}

export function extractTextFromHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function assertSafePublicUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Provide a valid public HTTPS or HTTP URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS webpages are supported.");
  const hostname = url.hostname.toLowerCase();
  const privateIp = /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);
  if (hostname === "localhost" || hostname.endsWith(".local") || privateIp) throw new Error("Only publicly reachable webpages may be imported.");
  return url;
}
