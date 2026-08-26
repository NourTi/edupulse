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

function normalizeIntentText(question: string) {
  return question.toLowerCase().replace(/[!؟?.,،؛:'’`]/g, " ").replace(/\s+/g, " ").trim();
}

function startsWithPhrase(normalized: string, phrase: string) {
  return normalized === phrase || normalized.startsWith(`${phrase} `);
}

export type ConversationIntent = "greeting" | "thanks" | "farewell" | null;

export function detectConversationIntent(question: string): ConversationIntent {
  const normalized = normalizeIntentText(question);
  const phrases = {
    thanks: ["thank you very much", "thank you so much", "thanks a lot", "thank you", "thankyou", "thanks", "thank u", "thx", "than you", "thak you", "much appreciated", "appreciate it", "you helped me", "you have helped me", "شكرا جزيلا", "شكرا لك", "شكرًا لك", "شكرا", "شكرًا", "مشكور", "بارك الله فيك", "جزاك الله خيرا", "يعطيك الصحة", "تمام شكرا", "حسنا شكرا"],
    greeting: ["hello", "hi", "hey", "good morning", "good evening", "مرحبا", "مرحبًا", "السلام عليكم", "صباح الخير", "مساء الخير", "أهلا", "أهلًا"],
    farewell: ["bye", "goodbye", "see you", "مع السلامة", "إلى اللقاء", "نراك لاحقا", "شكرا وداعا"],
  } as const;
  for (const phrase of phrases.thanks) if (startsWithPhrase(normalized, phrase)) return "thanks";
  for (const phrase of phrases.farewell) if (startsWithPhrase(normalized, phrase)) return "farewell";
  for (const phrase of phrases.greeting) if (startsWithPhrase(normalized, phrase)) return "greeting";
  return null;
}

export type PlatformIntent = "about" | "creator" | null;

export function detectPlatformIntent(question: string): PlatformIntent {
  const normalized = normalizeIntentText(question);
  const creatorTerms = ["who created edupulse", "who is the creator", "who is the founder", "creator of edupulse", "founder of edupulse", "من أنشأ edupulse", "من أسس edupulse", "من مؤسس edupulse", "من هو المؤسس", "صاحب المنصة", "مطور المنصة"];
  if (creatorTerms.some(term => normalized.includes(term))) return "creator";
  const aboutTerms = ["what is edupulse", "tell me about edupulse", "about edupulse", "what does edupulse do", "منصة edupulse", "عن edupulse", "ما هي edupulse", "ما هي المنصة", "من أنت"];
  if (aboutTerms.some(term => normalized.includes(term))) return "about";
  return null;
}

export function conversationReply(intent: Exclude<ConversationIntent, null>, isArabic: boolean) {
  if (intent === "thanks") return isArabic ? "على الرحب والسعة، وشكراً لك. أنا هنا لأي مساعدة أخرى؛ هل تحتاج إلى شيء آخر؟" : "You’re very welcome. I’m here if you need anything else—feel free to ask.";
  if (intent === "farewell") return isArabic ? "على الرحب والسعة. نتمنى لك يوماً موفقاً." : "You’re welcome. Have a great day.";
  return isArabic ? "مرحباً بك في EduPulse. اسألني عن البرامج، التسجيل، المواعيد، أو السياسات العامة المنشورة." : "Welcome to EduPulse. Ask me about published programmes, registration, schedules, or general policies.";
}

export function platformReply(intent: Exclude<PlatformIntent, null>, isArabic: boolean, ownerName: string) {
  if (intent === "creator") return isArabic ? `EduPulse منصة لإدارة المدارس والمؤسسات التعليمية، أنشأها ${ownerName}. تجمع المنصة معلومات المتعلمين، التسجيل، الحضور، المدفوعات، التقييمات، ومتابعة عمل المربين في مساحة واحدة. [P1]` : `EduPulse is a school and education-management platform created by ${ownerName}. It brings learner information, registration, attendance, payments, assessments, and educator workflows into one workspace. [P1]`;
  return isArabic ? `EduPulse منصة عربية أولاً لإدارة المدارس ومراكز التعليم. تساعد الإدارة والمربين على تنظيم بيانات المتعلمين، التسجيل، الحضور، المدفوعات، تقييمات CEFR، المتابعة، ومصادر السياسات المعتمدة، مع دعم مراحل التعليم الجزائرية. [P1]` : "EduPulse is an Arabic-first platform for schools and education centres. It helps teams organize learner records, registration, attendance, payments, CEFR assessments, educator follow-up, and approved policy knowledge, with support for Algeria’s education stages. [P1]";
}

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
