import { GoogleGenAI } from "@google/genai";
import { invokeVenice, veniceConfigured } from "./venice";

export type QuizQuestion = {
  question: string;
  options: [string, string, string, string] | string[];
  answer: string;
  explanation: string;
};

export type QuizResult = {
  questions: QuizQuestion[];
};

export type FlashcardItem = {
  front: string;
  back: string;
};

export type FlashcardsResult = {
  flashcards: FlashcardItem[];
};

function sanitizeJsonString(raw: string): string {
  let text = raw.trim();
  // Remove markdown code blocks if wrapped in ```json ... ``` or ``` ... ```
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/, "");
  }
  return text.trim();
}

/**
 * Heuristic fallback generator when LLM services are offline or keys are absent.
 * Breaks input study text into sentences and conceptual keypoints.
 */
function localFallbackQuiz(studyText: string, targetCount = 6): QuizResult {
  const clean = studyText.replace(/\r\n/g, "\n").trim();
  const rawSentences = clean
    .split(/(?<=[.!?؟\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 250);

  const sentences = rawSentences.length >= 4 ? rawSentences : [
    clean.slice(0, 120),
    clean.slice(120, 240),
    clean.slice(240, 360),
    clean.slice(360, 480),
  ].filter(s => s.length > 5);

  const count = Math.max(5, Math.min(10, Math.min(sentences.length, targetCount)));
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const focusSentence = sentences[i % sentences.length] || `المفهوم التعليمي الأساسي في النص رقم ${i + 1}`;
    // Extract key token
    const words = focusSentence.split(/\s+/).filter(w => w.length > 3);
    const keyToken = words[Math.floor(words.length / 2)] || "المفهوم المحوري";

    const questionText = focusSentence.length > 60
      ? `وفقاً للنص المدروس: ما الدلالة أو النتيجة المباشرة المرتبطة بـ "${focusSentence.slice(0, 50)}..."؟`
      : `استناداً إلى معطيات النص البيداغوجي: ما هو المفهوم الصحيح حول: "${focusSentence}"؟`;

    const correctAnswer = `تأكيد أن: ${focusSentence}`;
    const distractor1 = `نفي أثر هذا المفهوم واعتباره ثانوياً في المنهاج`;
    const distractor2 = `ربطه بحالة مغايرة تماماً لسياق المعطيات المذكورة`;
    const distractor3 = `افتراض عدم وجود علاقة سببية بين عناصر النص المطروح`;

    const options = [correctAnswer, distractor1, distractor2, distractor3];
    // deterministic shuffle
    const shuffled = [...options].sort(() => 0.5 - ((i % 3) * 0.2));

    questions.push({
      question: questionText,
      options: shuffled,
      answer: correctAnswer,
      explanation: `الجواب مستنتج مباشرة من نص الدرس: "${focusSentence}".`,
    });
  }

  return { questions };
}

function localFallbackFlashcards(studyText: string, targetCount = 12): FlashcardsResult {
  const clean = studyText.replace(/\r\n/g, "\n").trim();
  const lines = clean
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 8);

  const pool: string[] = [];
  for (const line of lines) {
    const parts = line.split(/(?<=[.!?:؛-])\s+/);
    for (const p of parts) {
      if (p.trim().length > 10) pool.push(p.trim());
    }
  }

  const items = pool.length >= 8 ? pool : [
    "الهدف التعلمي الأساسي للمنهاج",
    "الكفاءة الختامية المستهدفة في الوحدة",
    "المصطلحات والمفاهيم المحورية",
    "الاستراتيجية البيداغوجية المعتمدة",
    "التقويم التكويني وسيرورة التعلمات",
    "الوسائل الديداكتيكية المسخرة",
    "مؤشرات النجاح والتحكم المعرفي",
    "الأنشطة الاستكشافية الميدانية",
    "الربط مع المعارف القبلية للمتعلم",
    "المعالجة البيداغوجية وحالات الاستدراك",
  ];

  const total = Math.max(10, Math.min(15, targetCount));
  const flashcards: FlashcardItem[] = [];

  for (let i = 0; i < total; i++) {
    const source = items[i % items.length];
    const words = source.split(/\s+/);
    const front = words.length > 6
      ? `ما هو المدلول البيداغوجي لـ: "${words.slice(0, 4).join(" ")}..."؟`
      : `المصطلح / المفهوم: ${source}`;
    const back = `المضمون المستفاد من النص: ${source}، ويشكل ركيزة لفهم سيرورة الدرس وتطبيقاته.`;

    flashcards.push({ front, back });
  }

  return { flashcards };
}

/**
 * 1. Accept a block of study text as input.
 * 2. Generate 5–10 multiple-choice quiz questions based only on that text.
 * 3. Each question must include: the question text, 4 answer options, the correct answer, and a short explanation.
 * 4. Return the result as clean JSON matching this exact structure:
 *    { "questions": [ { "question": "", "options": ["", "", "", ""], "answer": "", "explanation": "" } ] }
 * 5. Do not include any extra commentary, headers, or metadata outside the JSON object.
 */
export async function generateQuizFromStudyText(
  studyText: string,
  options?: { count?: number; language?: string }
): Promise<QuizResult> {
  const text = (studyText || "").trim();
  if (!text) {
    throw new Error("Study text cannot be empty.");
  }

  const count = Math.max(5, Math.min(10, options?.count || 6));
  const systemPrompt = `You are an expert pedagogical assessment system.
Task:
1. Generate between 5 and 10 multiple-choice quiz questions based ONLY on the provided study text.
2. Each question MUST include:
   - "question": string (the clear, unambiguous question text)
   - "options": an array of exactly 4 strings (one correct, three plausible distractors)
   - "answer": string (the exact correct answer string matching one of the options)
   - "explanation": string (a short, factual pedagogical explanation based directly on the text)
3. Return the result as clean JSON matching this EXACT structure:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "answer": "",
      "explanation": ""
    }
  ]
}
4. Strictly do NOT include any markdown codeblocks, commentary, greetings, introductory text, headers, or metadata outside the JSON object. Return ONLY valid, parseable JSON.`;

  const userPrompt = `Study Text:\n\"\"\"\n${text}\n\"\"\"\n\nGenerate exactly ${count} multiple-choice quiz questions based ONLY on the text above.`;

  // 1. Try Gemini API first
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${systemPrompt}\n\n${userPrompt}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const rawText = response.text || "";
      const cleaned = sanitizeJsonString(rawText);
      const parsed = JSON.parse(cleaned) as QuizResult;

      if (Array.isArray(parsed?.questions) && parsed.questions.length >= 3) {
        // Validate question structure
        const validatedQuestions = parsed.questions.map(q => ({
          question: String(q.question || "").trim(),
          options: Array.isArray(q.options) && q.options.length === 4
            ? q.options.map(o => String(o).trim())
            : ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
          answer: String(q.answer || q.options?.[0] || "").trim(),
          explanation: String(q.explanation || "مبني مباشرة على نص الدرس.").trim(),
        }));

        return { questions: validatedQuestions.slice(0, 10) };
      }
    } catch (geminiError) {
      console.warn("[StudyGenerator] Gemini quiz generation error, attempting secondary fallback:", geminiError);
    }
  }

  // 2. Try Venice if configured
  if (veniceConfigured()) {
    try {
      const veniceRes = await invokeVenice({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        maxTokens: 1800,
      });
      const rawText = veniceRes.choices?.[0]?.message?.content || "";
      const cleaned = sanitizeJsonString(rawText);
      const parsed = JSON.parse(cleaned) as QuizResult;
      if (Array.isArray(parsed?.questions) && parsed.questions.length >= 3) {
        return {
          questions: parsed.questions.map(q => ({
            question: String(q.question || "").trim(),
            options: Array.isArray(q.options) && q.options.length === 4
              ? q.options.map(o => String(o).trim())
              : ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
            answer: String(q.answer || q.options?.[0] || "").trim(),
            explanation: String(q.explanation || "").trim(),
          })),
        };
      }
    } catch (veniceErr) {
      console.warn("[StudyGenerator] Venice quiz generation error:", veniceErr);
    }
  }

  // 3. Deterministic Local Pedagogical Fallback
  return localFallbackQuiz(text, count);
}

/**
 * 1. Accept the same type of study text as input.
 * 2. Generate 10–15 non-overlapping flashcards.
 * 3. Each flashcard must include a "front" (term or question) and "back" (definition or answer).
 * 4. Return the result as clean JSON matching this exact structure:
 *    { "flashcards": [ { "front": "", "back": "" } ] }
 * 5. Do not include any extra commentary, headers, or metadata outside the JSON object.
 */
export async function generateFlashcardsFromStudyText(
  studyText: string,
  options?: { count?: number; language?: string }
): Promise<FlashcardsResult> {
  const text = (studyText || "").trim();
  if (!text) {
    throw new Error("Study text cannot be empty.");
  }

  const count = Math.max(10, Math.min(15, options?.count || 12));
  const systemPrompt = `You are an expert pedagogical retrieval and active-recall specialist.
Task:
1. Generate between 10 and 15 non-overlapping flashcards based ONLY on the provided study text.
2. Each flashcard MUST include:
   - "front": string (a concise term, concept, formula, or prompting question)
   - "back": string (the exact definition, explanation, key takeaway, or answer)
3. Ensure flashcards cover distinct aspects of the text without redundancy.
4. Return the result as clean JSON matching this EXACT structure:
{
  "flashcards": [
    {
      "front": "",
      "back": ""
    }
  ]
}
5. Strictly do NOT include any markdown codeblocks, commentary, greetings, introductory text, headers, or metadata outside the JSON object. Return ONLY valid, parseable JSON.`;

  const userPrompt = `Study Text:\n\"\"\"\n${text}\n\"\"\"\n\nGenerate exactly ${count} non-overlapping flashcards based ONLY on the text above.`;

  // 1. Try Gemini API first
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${systemPrompt}\n\n${userPrompt}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const rawText = response.text || "";
      const cleaned = sanitizeJsonString(rawText);
      const parsed = JSON.parse(cleaned) as FlashcardsResult;

      if (Array.isArray(parsed?.flashcards) && parsed.flashcards.length >= 5) {
        const validatedCards = parsed.flashcards.map(c => ({
          front: String(c.front || "").trim(),
          back: String(c.back || "").trim(),
        })).filter(c => c.front.length > 0 && c.back.length > 0);

        return { flashcards: validatedCards.slice(0, 15) };
      }
    } catch (geminiError) {
      console.warn("[StudyGenerator] Gemini flashcards generation error, attempting secondary fallback:", geminiError);
    }
  }

  // 2. Try Venice if configured
  if (veniceConfigured()) {
    try {
      const veniceRes = await invokeVenice({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        maxTokens: 1800,
      });
      const rawText = veniceRes.choices?.[0]?.message?.content || "";
      const cleaned = sanitizeJsonString(rawText);
      const parsed = JSON.parse(cleaned) as FlashcardsResult;
      if (Array.isArray(parsed?.flashcards) && parsed.flashcards.length >= 5) {
        return {
          flashcards: parsed.flashcards.map(c => ({
            front: String(c.front || "").trim(),
            back: String(c.back || "").trim(),
          })),
        };
      }
    } catch (veniceErr) {
      console.warn("[StudyGenerator] Venice flashcards generation error:", veniceErr);
    }
  }

  // 3. Deterministic Local Pedagogical Fallback
  return localFallbackFlashcards(text, count);
}
