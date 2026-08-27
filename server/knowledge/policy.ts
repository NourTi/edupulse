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
    thanks: ["thank you very much", "thank you so much", "thanks a lot", "thank you", "thankyou", "thanks", "thank u", "thx", "than you", "than lyou", "than lyou very much", "thank lyou", "thank lyou very much", "thak you", "much appreciated", "appreciate it", "you helped me", "you have helped me", "شكرا جزيلا", "شكرا لك", "شكرًا لك", "شكرا", "شكرًا", "مشكور", "بارك الله فيك", "جزاك الله خيرا", "يعطيك الصحة", "تمام شكرا", "حسنا شكرا"],
    greeting: ["hello", "hi", "hey", "good morning", "good evening", "مرحبا", "مرحبًا", "السلام عليكم", "صباح الخير", "مساء الخير", "أهلا", "أهلًا"],
    farewell: ["bye", "goodbye", "see you", "مع السلامة", "إلى اللقاء", "نراك لاحقا", "شكرا وداعا"],
  } as const;
  for (const phrase of phrases.thanks) if (startsWithPhrase(normalized, phrase)) return "thanks";
  for (const phrase of phrases.farewell) if (startsWithPhrase(normalized, phrase)) return "farewell";
  for (const phrase of phrases.greeting) if (startsWithPhrase(normalized, phrase)) return "greeting";
  return null;
}

export type EnrollmentIntent = "enrollment" | null;

export function detectEnrollmentIntent(question: string): EnrollmentIntent {
  const normalized = normalizeIntentText(question);
  const terms = [
    "sign my son", "sign my daughter", "sign my child", "register my son", "register my daughter", "register my child",
    "enroll my son", "enrol my son", "enroll my daughter", "enrol my daughter", "enroll my child", "enrol my child",
    "enrollment", "enrolment", "admission", "how do i register", "how can i register", "how to register",
    "تسجيل ابني", "تسجيل ابنتي", "تسجيل طفلي", "أريد تسجيل ابني", "اريد تسجيل ابني", "أريد تسجيل ابنتي", "كيف أسجل ابني", "كيف اسجل ابني", "التسجيل",
  ];
  return terms.some(term => normalized.includes(term)) ? "enrollment" : null;
}

export function enrollmentReply(isArabic: boolean) {
  return isArabic
    ? "يسعدنا مساعدتك في تسجيل ابنك أو ابنتك. ابدأ بإرسال طلب التسجيل من بوابة المؤسسة أو تواصل مع الإدارة لمعرفة المقاعد المتاحة والوثائق المطلوبة. لا ترسل هنا درجات الطالب أو بياناته الخاصة."
    : "We can help you start an enrolment request. Use the institution’s registration portal or contact the administration to confirm available places and required documents. Please do not send grades or private student details in this public chat.";
}

export type PlatformIntent = "about" | "creator" | null;

export function detectPlatformIntent(question: string): PlatformIntent {
  const normalized = normalizeIntentText(question);
  const creatorTerms = ["who created edupulse", "who is the creator", "who is the founder", "creator of edupulse", "founder of edupulse", "who built edupulse", "who made edupulse", "who is behind edupulse", "من أنشأ edupulse", "من أسس edupulse", "من مؤسس edupulse", "من هو المؤسس", "من صنع edupulse", "من أنشأ هذه المنصة", "صاحب المنصة", "مطور المنصة"];
  if (creatorTerms.some(term => normalized.includes(term))) return "creator";
  const aboutTerms = ["what is edupulse", "tell me about edupulse", "about edupulse", "what does edupulse do", "what can edupulse do", "how does edupulse work", "features of edupulse", "benefits of edupulse", "what is this platform", "tell me about the platform", "what does this platform do", "how does this platform work", "منصة edupulse", "عن edupulse", "ما هي edupulse", "ما هي المنصة", "ماذا تقدم المنصة", "كيف تعمل المنصة", "مزايا المنصة", "فوائد المنصة", "من أنت"];
  if (aboutTerms.some(term => normalized.includes(term))) return "about";
  const platformMarkers = ["edupulse", "المنصة", "platform"];
  const platformQuestionWords = ["feature", "features", "benefit", "benefits", "work", "use", "do", "مزايا", "فوائد", "تعمل", "تقدم"];
  if (platformMarkers.some(marker => normalized.includes(marker)) && platformQuestionWords.some(word => normalized.includes(word))) return "about";
  return null;
}

export function conversationReply(intent: Exclude<ConversationIntent, null>, isArabic: boolean) {
  if (intent === "thanks") return isArabic ? "على الرحب والسعة، وشكراً لك. أنا هنا لأي مساعدة أخرى؛ هل تحتاج إلى شيء آخر؟" : "You’re very welcome. I’m here if you need anything else—feel free to ask.";
  if (intent === "farewell") return isArabic ? "على الرحب والسعة. نتمنى لك يوماً موفقاً." : "You’re welcome. Have a great day.";
  return isArabic ? "مرحباً بك في EduPulse. اسألني عن البرامج، التسجيل، المواعيد، أو السياسات العامة المنشورة." : "Welcome to EduPulse. Ask me about published programmes, registration, schedules, or general policies.";
}

export function platformReply(intent: Exclude<PlatformIntent, null>, isArabic: boolean, ownerName: string) {
  const creator = ownerName.trim() || (isArabic ? "صاحب المنصة" : "the EduPulse creator");
  if (intent === "creator") return isArabic ? `EduPulse منصة لإدارة المدارس والمؤسسات التعليمية، أنشأها ${creator}، وهو أستاذ للغة الإنجليزية ومربٍ حاصل على درجة الدكتوراه يدرّس في الجامعة والتعليم الثانوي. جاءت الفكرة من الحاجة إلى تنظيم العمل التعليمي اليومي في مساحة عربية واضحة، تجمع معلومات المتعلمين، التسجيل، الحضور، المدفوعات، التقييمات، ومتابعة عمل المربين. [P1]` : `EduPulse is a school and education-management platform created by ${creator}, an English teacher and PhD educator who teaches at university and secondary-school levels. The project responds to the need for a clear Arabic-first workspace that brings learner information, registration, attendance, payments, assessments, and educator follow-up together. [P1]`;
  return isArabic ? `EduPulse منصة عربية أولاً لإدارة المدارس ومراكز التعليم والمربين. تبدأ المؤسسة بإعداد الأدوار والمواد والمراحل، ثم تسجل المتعلمين وتتابع الحضور والتقييمات والمدفوعات والتواصل وتقارير التقدم. تستهدف المدارس الخاصة، مراكز اللغات والتدريب، المدرسين المستقلين، والفرق الجامعية. كما تتضمن مسار CRM للمربي لمتابعة المهام والموارد والبحوث والسلوك والتطور اللغوي، ومساعداً يعتمد على المصادر المعتمدة بدلاً من التخمين. تدعم المنصة مراحل التعليم الجزائرية من التحضيري إلى التعليم العالي بنظام LMD، مع حدود واضحة للخصوصية. [P1]` : `EduPulse is an Arabic-first platform for schools, education centres, and educators. An institution configures roles, subjects, and stages, then registers learners and follows attendance, assessment, payments, communication, and progress reports. It is aimed at private schools, language and training centres, independent educators, and university teams. Its educator CRM tracks tasks, resources, research, behaviour, mentorship, and language development, while its assistant uses approved sources instead of guessing. The platform supports Algeria’s pathway from preparatory education through LMD higher education, with clear privacy boundaries. [P1]`;
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

const retrievalStopWords = new Set(["a", "an", "the", "is", "are", "am", "what", "which", "who", "where", "when", "why", "how", "do", "does", "can", "could", "i", "me", "my", "you", "your", "we", "our", "to", "of", "in", "on", "for", "about", "please", "tell", "this", "these", "that", "it", "وا", "و", "ما", "ماذا", "من", "أين", "متى", "لماذا", "كيف", "هل", "عن", "في", "منصة", "لي", "ابني", "ابنتي"]);

function tokens(value: string) {
  return Array.from(new Set((value.toLowerCase().match(/[A-Za-z0-9\u0600-\u06FF]{2,}/g) ?? []).filter(token => !retrievalStopWords.has(token))));
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

export function validateGroundedAnswer(answer: string, sourceCount: number) {
  const citations = Array.from(answer.matchAll(/\[S(\d+)\]/g)).map(match => Number(match[1]));
  if (!answer.trim() || citations.length === 0) return false;
  return citations.every(citation => citation >= 1 && citation <= sourceCount);
}

export function isLikelyTruncatedAnswer(answer: string, finishReason?: string | null) {
  if (finishReason === "length" || finishReason === "max_tokens") return true;
  const trimmed = answer.trim();
  if (!trimmed) return true;
  return /(?:\.{3}|…|[,،:]|\b(and|or|with|to|و|أو|مع|إلى))$/i.test(trimmed);
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
