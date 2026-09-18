import { GoogleGenAI } from "@google/genai";

export type GenerationLanguage = "ar" | "fr" | "both";
export type GenerationMode = "quick" | "detailed";

export interface LessonNotesInput {
  subject: string;
  gradeLevel: string;
  topic: string;
  language?: GenerationLanguage;
  mode?: GenerationMode;
}

export interface QuizInput {
  subject: string;
  topic: string;
  numberOfQuestions?: number;
  language?: GenerationLanguage;
  mode?: GenerationMode;
}

export interface QuizQuestionItem {
  question: string;
  options: [string, string, string, string] | string[];
  answer: string;
  explanation: string;
}

export interface QuizOutput {
  questions: QuizQuestionItem[];
}

export interface RubricInput {
  subject: string;
  topic: string;
  assignmentType: string;
  language?: GenerationLanguage;
  mode?: GenerationMode;
}

export interface SupportSheetsInput {
  subject: string;
  topic: string;
  language?: GenerationLanguage;
  mode?: GenerationMode;
}

export interface SupportSheetsOutput {
  easy: string;
  standard: string;
  advanced: string;
  fullMarkdown: string;
}

export interface SummaryFlashcardsInput {
  topicOrText: string;
  subject?: string;
  language?: GenerationLanguage;
  mode?: GenerationMode;
}

export interface FlashcardPair {
  front: string;
  back: string;
}

export interface SummaryFlashcardsOutput {
  summary: string;
  flashcards: FlashcardPair[];
}

export interface HomeworkInput {
  subject: string;
  topic: string;
  gradeLevel: string;
  language?: GenerationLanguage;
  mode?: GenerationMode;
}

export interface RegenerateSectionInput {
  generatorType: "lesson_notes" | "support_sheets";
  sectionKey: string; // e.g., "Objectives", "Evaluation", "Easy", "Advanced"
  sectionTitle: string;
  subject: string;
  topic: string;
  gradeLevel?: string;
  fullContext?: string;
  language?: GenerationLanguage;
  mode?: GenerationMode;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function sanitizeJsonString(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/, "");
  }
  return text.trim();
}

function getLanguageInstruction(lang: GenerationLanguage = "ar"): string {
  if (lang === "fr") {
    return "Language: French only (Rédigez l'intégralité du contenu en français académique, clair et pédagogique).";
  }
  if (lang === "both") {
    return "Language: Bilingual Side-by-Side (French and Arabic). For each section, provide both Arabic and French translations or parallel bilingual explanations clearly labeled.";
  }
  return "Language: Arabic (باللغة العربية التربوية الفصحى والواضحة مع المصطلحات العلمية إن وجدت).";
}

function getModeInstruction(mode: GenerationMode = "detailed"): string {
  if (mode === "quick") {
    return "Style & Depth: Quick Mode — Concise, direct, high-impact bullet points, easy to scan in under 60 seconds.";
  }
  return "Style & Depth: Detailed Mode — Comprehensive, richly structured pedagogical explanations, step-by-step guidance, and differentiated approaches.";
}

/* =========================================================================
   1. LESSON NOTES GENERATOR
   Output: Markdown with exactly these 10 sections in order:
   Objectives, Prerequisites, Materials, Introduction, Detailed Content,
   Timeline/Pacing, Pedagogical Differentiation, Student Activities, Evaluation, Conclusion.
   ========================================================================= */

export async function generateLessonNotes(input: LessonNotesInput): Promise<string> {
  const { subject, gradeLevel, topic, language = "ar", mode = "detailed" } = input;
  const langPrompt = getLanguageInstruction(language);
  const modePrompt = getModeInstruction(mode);

  const prompt = `You are a master pedagogical curriculum expert.
Generate a structured, professional teacher lesson note plan for:
- Subject: ${subject}
- Grade Level: ${gradeLevel}
- Topic: ${topic}
${langPrompt}
${modePrompt}

MANDATORY REQUIREMENT:
The output MUST be in formatted Markdown and MUST contain EXACTLY these 10 sections in this strict sequential order:
1. Objectives
2. Prerequisites
3. Materials
4. Introduction
5. Detailed Content
6. Timeline/Pacing
7. Pedagogical Differentiation
8. Student Activities
9. Evaluation
10. Conclusion

Use Markdown h2 headings formatted exactly like:
## 1. Objectives
## 2. Prerequisites
## 3. Materials
## 4. Introduction
## 5. Detailed Content
## 6. Timeline/Pacing
## 7. Pedagogical Differentiation
## 8. Student Activities
## 9. Evaluation
## 10. Conclusion

(If language is Arabic, use the standard Arabic equivalent alongside the English section name, e.g. "## 1. Objectives | الأهداف التعلمية").
Ensure each section contains substantive, actionable pedagogical content tailored specifically to the subject and grade level.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });
      const text = response.text?.trim();
      if (text && text.includes("Objectives") && text.includes("Conclusion")) {
        return text;
      }
    } catch (err) {
      console.warn("[TeacherGenerators] Gemini Lesson Notes generation failed, using pedagogical fallback:", err);
    }
  }

  return fallbackLessonNotes(input);
}

function fallbackLessonNotes(input: LessonNotesInput): string {
  const { subject, gradeLevel, topic, language = "ar" } = input;
  const isFr = language === "fr";
  const isBoth = language === "both";

  if (isFr) {
    return `# Fiche Pédagogique : ${topic}
**Discipline :** ${subject} | **Niveau :** ${gradeLevel}

## 1. Objectives
- Maîtriser les notions clés relatives à "${topic}".
- Appliquer les démarches d'analyse et de résolution propres à la discipline.
- Développer l'autonomie critique et la rigueur méthodologique.

## 2. Prerequisites
- Connaissances de base acquises lors des séances antérieures de ${subject}.
- Maîtrise des termes fondamentaux et des outils de travail élémentaires.

## 3. Materials
- Manuel scolaire officiel et polycopiés d'activités.
- Tableau blanc/interactif et fiches d'exercices structurées.

## 4. Introduction
Mise en situation stimulante (5 à 7 minutes) : questionnement guidé pour relier le vécu des élèves ou un exemple concret aux enjeux de "${topic}".

## 5. Detailed Content
- **Définition et concepts essentiels :** Présentation claire et contextualisée.
- **Règles et mécanismes :** Explication des principes structurants.
- **Applications concrètes :** Étude d'un cas pratique ou résolution guidée.

## 6. Timeline/Pacing
- 00–10 min : Rappel des prérequis et accroche.
- 10–30 min : Découverte et institutionnalisation du savoir.
- 30–50 min : Activités d'entraînement et synthèse.
- 50–60 min : Bilan et évaluation formative.

## 7. Pedagogical Differentiation
- **Pour les élèves en difficulté :** Fiches repères guidées et étayage renforcé.
- **Pour les élèves avancés :** Exercices d'approfondissement et situations-problèmes ouvertes.

## 8. Student Activities
- Analyse individuelle d'un document ou d'un exercice type.
- Travail en binômes pour confronter les hypothèses de réponse.
- Restitution collective avec justification orale.

## 9. Evaluation
- Questions rapides de compréhension orale.
- Mini-quiz d'évaluation formative sur les 3 notions centrales.

## 10. Conclusion
Synthèse des acquis clés par les apprenants et présentation des prolongements prévus pour la prochaine séance.`;
  }

  const bothSuffix = isBoth ? `\n\n*(Note bilingue : Objectifs & démarche disponibles en arabe et en français)*` : "";

  return `# مذكرة الدرس البيداغوجية: ${topic}
**المادة:** ${subject} | **المستوى الدراسي:** ${gradeLevel} ${bothSuffix}

## 1. Objectives | الأهداف التعلمية
- استيعاب المفاهيم المحورية المتعلقة بموضوع "${topic}".
- تنمية القدرة على التحليل والتطبيق المنهجي في مادة ${subject}.
- تحقيق الكفاءة الختامية المستهدفة في المنهاج الرسمي.

## 2. Prerequisites | المكتسبات القبلية
- المعارف والمكتسبات السابقة ذات الصلة المباشرة بالوحدة.
- استحضار القواعد والمصطلحات الأساسية المكتسبة في الحصص الماضية.

## 3. Materials | الوسائل والوسائط الديداكتيكية
- الكتاب المدرسي، الدعامة الورقية، والسبورة التفاعلية.
- وثائق وأمثلة إيضاحية مجهزة مسبقاً.

## 4. Introduction | وضعية الانطلاق والتمهيد
- طرح وضعية إشكالية مشوقة (5–7 دقائق) تحفز الفضول المعرفي لدى المتعلمين.
- استدراج التلاميذ لطرح الفرضيات وبناء الرابط مع موضوع الدرس.

## 5. Detailed Content | المضمون المعرفي المفصل
- **المفهوم الأول:** التعريف العلمي الدقيق للمصطلحات الأساسية.
- **المفهوم الثاني:** العلاقات البنيوية والقواعد المنظمة لموضوع "${topic}".
- **النمذجة والتطبيق:** تقديم نموذج تطبيقي محلول يوضح خطوات العمل.

## 6. Timeline/Pacing | التوزيع الزمني للحصة
- 00–10 د: وضعية الانطلاق والمراجعة القبلية.
- 10–30 د: بناء التعلمات واستنتاج القواعد الأساسية.
- 30–50 د: الأنشطة التطبيقية والممارسة الموجهة.
- 50–60 د: التقويم التكويني والحوصلة الختامية.

## 7. Pedagogical Differentiation | الفروق الفردية والتمايز البيداغوجي
- **الدعم والاستدراك:** بطاقات مساعدة وتوجيه فردي للطلاب المتعثرين.
- **الإثراء والتعميق:** أنشطة تحدي إضافية للمتعلمين ذوي التحصيل المتقدم.

## 8. Student Activities | أنشطة المتعلمين
- نشاط استكشافي فردي لقراءة وتحليل المعطيات.
- عمل ثنائي أو فوجي للمقارنة واستخلاص النتائج.
- صياغة الخلاصة التشاركية على السبورة والدفاتر.

## 9. Evaluation | التقويم التكويني ومؤشرات الكفاءة
- أسئلة شفهية استطلاعية سريعة لقياس مدى الاستيعاب.
- تمرين قصير (5 دقائق) للتأكد من تحقق مؤشرات النجاح.

## 10. Conclusion | الحوصلة والخاتمة
- تلخيص جماعي لأهم ما تم التوصل إليه خلال الحصة، مع تكليف منزلي خفيف تمهيداً للحصة القادمة.`;
}

/* =========================================================================
   2. QCM QUIZ GENERATOR
   Output: clean JSON:
   { "questions": [ { "question": "", "options": ["", "", "", ""], "answer": "", "explanation": "" } ] }
   No text outside the JSON.
   ========================================================================= */

export async function generateQcmQuiz(input: QuizInput): Promise<QuizOutput> {
  const { subject, topic, numberOfQuestions = 5, language = "ar", mode = "detailed" } = input;
  const count = Math.max(3, Math.min(15, numberOfQuestions));
  const langPrompt = getLanguageInstruction(language);
  const modePrompt = getModeInstruction(mode);

  const prompt = `You are an expert educational assessment creator.
Generate a multiple-choice QCM quiz for:
- Subject: ${subject}
- Topic: ${topic}
- Target number of questions: ${count}
${langPrompt}
${modePrompt}

MANDATORY OUTPUT FORMAT:
Output ONLY valid, parseable JSON matching this EXACT schema with NO text, markdown fences, or commentary outside the JSON:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Short pedagogical reason why this is correct."
    }
  ]
}

Ensure:
- Exactly 4 options per question.
- "answer" must match one of the 4 options verbatim.
- Distractors must be plausible and educationally sound.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      const text = response.text?.trim() || "";
      const cleaned = sanitizeJsonString(text);
      const parsed = JSON.parse(cleaned) as QuizOutput;
      if (Array.isArray(parsed?.questions) && parsed.questions.length >= 2) {
        return {
          questions: parsed.questions.map(q => ({
            question: String(q.question || "").trim(),
            options: Array.isArray(q.options) && q.options.length === 4
              ? q.options.map(o => String(o).trim())
              : ["أ", "ب", "ج", "د"],
            answer: String(q.answer || q.options?.[0] || "").trim(),
            explanation: String(q.explanation || "إجابة مستندة إلى المنهاج المعتمد.").trim(),
          })),
        };
      }
    } catch (err) {
      console.warn("[TeacherGenerators] Gemini QCM Quiz generation error:", err);
    }
  }

  return fallbackQuiz(input);
}

function fallbackQuiz(input: QuizInput): QuizOutput {
  const { subject, topic, numberOfQuestions = 5, language = "ar" } = input;
  const isFr = language === "fr";
  const count = Math.max(3, Math.min(10, numberOfQuestions));
  const questions: QuizQuestionItem[] = [];

  for (let i = 1; i <= count; i++) {
    if (isFr) {
      const qText = `Question ${i} (${subject}) : Quelle affirmation décrit avec le plus d'exactitude le concept de "${topic}" ?`;
      const correct = `L'affirmation ${i} validant rigoureusement les propriétés clés de ${topic}.`;
      questions.push({
        question: qText,
        options: [
          correct,
          `Une hypothèse contradictoire avec les principes fondamentaux de ${subject}.`,
          `Une généralisation imprécise sans fondement scientifique direct.`,
          `Une confusion entre les causes et les conséquences du phénomène.`,
        ],
        answer: correct,
        explanation: `Cette réponse découle directement des définitions et théorèmes fondamentaux régissant ${topic}.`,
      });
    } else {
      const qText = `السؤال ${i} في مادة ${subject}: ما هي العبارة الأكثر دقة في توصيف وتطبيق مفهوم "${topic}"؟`;
      const correct = `التحديد العلمي الصحيح الذي يبرز الخصائص الجوهرية لـ ${topic}.`;
      questions.push({
        question: qText,
        options: [
          correct,
          `افتراض غير مطابق لمعايير المنهاج في مادة ${subject}.`,
          `تفسير جزئي يغفل الشروط الأساسية لتطبيق المفهوم.`,
          `الخلط بين المقدمات والنتائج التجريبية المرتبطة بالظاهرة.`,
        ],
        answer: correct,
        explanation: `تعتبر هذه الإجابة النموذجية المعتمدة بيداغوجياً لترسيخ مفهوم ${topic}.`,
      });
    }
  }

  return { questions };
}

/* =========================================================================
   3. RUBRIC GENERATOR
   Input: subject, topic, assignment type.
   Output: a Markdown table with criteria as rows and performance levels
   (Excellent, Good, Fair, Needs Improvement) as columns, each with a clear descriptor.
   ========================================================================= */

export async function generateRubric(input: RubricInput): Promise<string> {
  const { subject, topic, assignmentType, language = "ar", mode = "detailed" } = input;
  const langPrompt = getLanguageInstruction(language);
  const modePrompt = getModeInstruction(mode);

  const prompt = `You are an expert assessment designer and teacher evaluator.
Generate an evaluation Rubric (سلم تقييم وتحكيم تحصيلي) for:
- Subject: ${subject}
- Topic: ${topic}
- Assignment Type: ${assignmentType} (e.g., Essay, Lab Report, Project, Oral Presentation, Problem Solving)
${langPrompt}
${modePrompt}

MANDATORY OUTPUT FORMAT:
Output MUST include a clean, formatted Markdown table where:
- Criteria are rows (at least 4-5 rigorous criteria, e.g., Understanding of Concepts, Methodology, Analysis & Execution, Communication/Presentation, Critical Reflection).
- The columns MUST be exactly these 4 performance levels:
  | Criteria | Excellent | Good | Fair | Needs Improvement |
  (or in Arabic/French if requested, with clear performance descriptors in every single cell).
Include a brief introductory paragraph summarizing the assignment purpose and scoring weighting (e.g., points or percentages).`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.25,
        },
      });
      const text = response.text?.trim();
      if (text && text.includes("|") && (text.includes("Excellent") || text.includes("ممتاز"))) {
        return text;
      }
    } catch (err) {
      console.warn("[TeacherGenerators] Gemini Rubric generation error:", err);
    }
  }

  return fallbackRubric(input);
}

function fallbackRubric(input: RubricInput): string {
  const { subject, topic, assignmentType, language = "ar" } = input;
  const isFr = language === "fr";

  if (isFr) {
    return `# Grille d'Évaluation Analytique : ${topic}
**Discipline :** ${subject} | **Type d'activité :** ${assignmentType}

Cette grille définit les critères de maîtrise attendus pour l'activité "${assignmentType}". Chaque niveau reflète un degré d'autonomie et de précision conceptuelle.

| Critères d'évaluation | Excellent (18–20) | Bon (14–17) | Passable (10–13) | À améliorer (< 10) |
| :--- | :--- | :--- | :--- | :--- |
| **Compréhension conceptuelle** | Maîtrise parfaite et nuancée des concepts de ${topic} ; aucune confusion terminologique. | Bonne maîtrise d'ensemble ; concepts appliqués correctement avec de légères imprécisions. | Compréhension superficielle ou partielle ; erreurs mineures dans l'utilisation des notions. | Notions fondamentales mal comprises ou confondues ; contresens majeurs. |
| **Démarche & Méthodologie** | Démarche d'analyse rigoureuse, logique, structurée et parfaitement justifiée. | Méthode cohérente et appliquée de façon autonome avec peu d'hésitations. | Méthode appliquée de façon mécanique sans réelle justification réflexive. | Absence de méthode identifiable ; travail désorganisé ou incomplet. |
| **Résolution & Analyse critique** | Solutions innovantes, esprit critique aiguisé et argumentation solide étayée par des preuves. | Réponses justes et argumentées de manière satisfaisante. | Réponses en partie correctes mais argumentation lacunaire ou fragile. | Réponses inexactes ou non argumentées ; absence d'analyse critique. |
| **Rigueur & Clarté d'expression** | Expression soignée, syntaxe et vocabulaire disciplinaire irréprochables ; présentation exemplaire. | Expression claire et vocabulaire technique adéquat ; quelques rares maladresses. | Expression compréhensible mais style relâché ; erreurs de syntaxe récurrentes. | Expression confuse entravant la compréhension ; présentation négligée. |`;
  }

  return `# سلم التقييم التحليلي الموحد: ${topic}
**المادة:** ${subject} | **نوع المهمة/التقييم:** ${assignmentType}

يوفر هذا السلم معايير موضوعية واضحة لقياس كفاءة وأداء المتعلم في مهمة "${assignmentType}" لضمان العدالة البيداغوجية والشفافية.

| معيار التقييم | ممتاز (18–20) | جيد (14–17) | متوسط / مقبول (10–13) | يحتاج إلى تحسين (< 10) |
| :--- | :--- | :--- | :--- | :--- |
| **التحكم المفاهيمي والمعرفي** | استيعاب شامل ودقيق لكافة مفاهيم "${topic}"، مع استخدام متقن للمصطلحات العلمية. | استيعاب جيد جداً للمفاهيم الأساسية، مع وجود ملاحظات جزئية لا تؤثر على صحة المضمون. | فهم سطحي أو جزئي للمفاهيم مع بعض الخلط بين المصطلحات ذات الصلة. | غياب الفهم للمبادئ الأساسية، ووقوع أخطاء علمية جوهرية ومتكررة. |
| **المنهجية وخطوات التنفيذ** | خطوات عمل منظمة ومنطقية تتطابق تماماً مع المنهجية المعتمدة في ${subject}. | منهجية واضحة ومتبعة باستقلالية، مع تنظيم سليم لمراحل الإنجاز. | تطبيق آلي للمنهجية دون تبرير منطقي كافٍ لمراحل العمل. | غياب المنهجية، وعشوائية في التقديم أو ترك خطوات أساسية دون إنجاز. |
| **التحليل والاستدلال النقدي** | تقديم براهين محكمة وقدرة عالية على الربط والاستنتاج وحل الإشكاليات ببراعة. | تحليل سليم وتبريرات مقنعة لمعظم الفرضيات والنتائج المطروحة. | محاولات استدلال مقبولة لكن ينقصها العمق والربط المنطقي المتين. | غياب التبرير والتحليل النقدي، والاعتماد على تخمينات غير مبررة. |
| **الدقة واللغة والتنظيم** | سلامة لغوية فائقة، ودقة حسابية/بيانية، وعرض متقن يعكس العناية والاحترافية. | لغة واضحة وتنظيم جيد مع أخطاء شكلية محدودة لا تعيق قراءة العمل. | وضوح نسبي مع وجود أخطاء متكررة في الصياغة أو تنسيق الجداول والأرقام. | غموض في الصياغة، كثرة الأخطاء المشوشة، وإهمال واضح في التنظيم العام. |`;
}

/* =========================================================================
   4. DIFFERENTIATED SUPPORT SHEETS GENERATOR
   Input: subject, topic.
   Output: three Markdown worksheets labeled "Easy," "Standard," and "Advanced."
   ========================================================================= */

export async function generateSupportSheets(input: SupportSheetsInput): Promise<SupportSheetsOutput> {
  const { subject, topic, language = "ar", mode = "detailed" } = input;
  const langPrompt = getLanguageInstruction(language);
  const modePrompt = getModeInstruction(mode);

  const prompt = `You are an expert in pedagogical differentiation (البيداغوجيا الفارقية والتعليم المتمايز).
Generate three distinct, complete educational worksheets for:
- Subject: ${subject}
- Topic: ${topic}
${langPrompt}
${modePrompt}

MANDATORY OUTPUT FORMAT:
You MUST generate THREE separate worksheets labeled exactly:
# Worksheet 1: Easy
# Worksheet 2: Standard
# Worksheet 3: Advanced

Each worksheet must have:
- Target level / Audience indicator.
- Scaffolding & Context (more guidance in Easy, open-ended in Advanced).
- Practical Exercises / Activities specifically adapted to that tier.
- Self-check hint or guiding checklist.

Return the complete Markdown containing all three worksheets.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.35,
        },
      });
      const text = response.text?.trim();
      if (text && (text.includes("Easy") || text.includes("مستوى 1")) && (text.includes("Advanced") || text.includes("مستوى 3"))) {
        return parseSupportSheets(text);
      }
    } catch (err) {
      console.warn("[TeacherGenerators] Gemini Support Sheets generation error:", err);
    }
  }

  return fallbackSupportSheets(input);
}

function parseSupportSheets(fullText: string): SupportSheetsOutput {
  // Split into Easy, Standard, Advanced
  const easyMatch = fullText.match(/(?:#+\s*(?:Worksheet\s*1:?\s*Easy|Easy|مستوى\s*ميسّر|المستوى\s*الأول))([\s\S]*?)(?=#+\s*(?:Worksheet\s*2:?\s*Standard|Standard|مستوى\s*متوسط|المستوى\s*الثاني)|$)/i);
  const standardMatch = fullText.match(/(?:#+\s*(?:Worksheet\s*2:?\s*Standard|Standard|مستوى\s*متوسط|المستوى\s*الثاني))([\s\S]*?)(?=#+\s*(?:Worksheet\s*3:?\s*Advanced|Advanced|مستوى\s*متقدم|المستوى\s*الثالث)|$)/i);
  const advancedMatch = fullText.match(/(?:#+\s*(?:Worksheet\s*3:?\s*Advanced|Advanced|مستوى\s*متقدم|المستوى\s*الثالث))([\s\S]*$)/i);

  const easy = easyMatch ? easyMatch[0].trim() : fullText.slice(0, Math.floor(fullText.length / 3));
  const standard = standardMatch ? standardMatch[0].trim() : fullText.slice(Math.floor(fullText.length / 3), Math.floor((fullText.length * 2) / 3));
  const advanced = advancedMatch ? advancedMatch[0].trim() : fullText.slice(Math.floor((fullText.length * 2) / 3));

  return {
    easy,
    standard,
    advanced,
    fullMarkdown: fullText,
  };
}

function fallbackSupportSheets(input: SupportSheetsInput): SupportSheetsOutput {
  const { subject, topic, language = "ar" } = input;
  const isFr = language === "fr";

  if (isFr) {
    const easy = `# Fiche d'Appui 1 : Niveau Facile (Easy)
**Thème :** ${topic} | **Discipline :** ${subject}
*Objectif d'étayage : Consolidation des notions de base avec guidage pas-à-pas.*

### 1. Rappel clé avec aide-mémoire
Rappel visuel des 2 définitions essentielles pour aborder ${topic} sans blocage technique.

### 2. Exercice guidé avec amorce de réponse
Complétez les phrases suivantes ou résolvez l'application directe en suivant les étapes fléchées (Étape 1 ➔ Étape 2).

### 3. Auto-évaluation formative
- [ ] J'ai identifié le mot-clé principal.
- [ ] J'ai vérifié mon résultat avec l'exemple modèle.`;

    const standard = `# Fiche d'Appui 2 : Niveau Standard (Standard)
**Thème :** ${topic} | **Discipline :** ${subject}
*Objectif d'autonomie : Application rigoureuse des compétences du programme.*

### 1. Situation-problème classique
Application directe des règles méthodologiques de ${topic} dans un contexte d'examen standard.

### 2. Exercices d'entraînement
- Résolution autonome en 3 étapes sans indices intermédiaires.
- Justification rédigée des choix méthodologiques adoptés.

### 3. Critères de réussite
Vérification de la conformité du raisonnement et de l'exactitude des calculs ou analyses.`;

    const advanced = `# Fiche d'Appui 3 : Niveau Avancé (Advanced)
**Thème :** ${topic} | **Discipline :** ${subject}
*Objectif d'enrichissement : Dépassement, transfert interdisciplinaire et esprit critique.*

### 1. Défi d'approfondissement
Situation complexe ou cas atypique nécessitant de combiner ${topic} avec d'autres unités du programme.

### 2. Tâche complexe ouverte
Formulation d'hypothèses personnelles, modélisation alternative et démonstration formelle.

### 3. Prolongement vers la recherche
Question d'ouverture invitant l'élève à extrapoler les implications du concept.`;

    return {
      easy,
      standard,
      advanced,
      fullMarkdown: `${easy}\n\n---\n\n${standard}\n\n---\n\n${advanced}`,
    };
  }

  const easy = `# ورقة الدعم البيداغوجي 1: المستوى الميسّر (Easy)
**الموضوع:** ${topic} | **المادة:** ${subject}
*الهدف التمايزي: تذليل الصعوبات وترسيخ المفاهيم القاعدية بمرافقة موجهة وإرشادات خطوة بخطوة.*

### 1. الإسناد والمفتاح المعرفي
- بطاقة تذكيرية سريعة بالمصطلحات الأساسية والقاعدة الذهبية في ${topic}.
- مثال محلول يبين طريقة التفكير الصحيحة لتفادي الأخطاء الشائعة.

### 2. الأنشطة والتمارين الموجهة
- **النشاط 1 (تطبيق مباشر):** تمرين ملء فراغات أو اختيار متعدد لتثبيت المصطلح الصحيح.
- **النشاط 2 (حل بإرشادات):** حل مسألة مبسطة مع تقديم الخطوة الأولى كنموذج إرشادي.

### 3. مؤشر التحقق الذاتي
- [ ] تذكرت القاعدة الأساسية دون الرجوع إلى الكراس.
- [ ] طبقت الإجراءات بصورة صحيحة في التمرين الثاني.`;

  const standard = `# ورقة الدعم البيداغوجي 2: المستوى القياسي (Standard)
**الموضوع:** ${topic} | **المادة:** ${subject}
*الهدف التمايزي: تعزيز استقلالية المتعلم في تطبيق كفاءات المنهاج الوطني المقررة.*

### 1. سياق التطبيق المنهجي
وضعية تعلمية متوازنة تحاكي مواضيع الفروض الرسمية، وتتطلب التوظيف السليم لمعارف ${topic}.

### 2. التمارين والممارسات المستقلة
- **التمرين 1:** تحليل معطيات المسألة واستخراج العلاقات الأساسية دون إرشادات مسبقة.
- **التمرين 2:** بناء إجابة مكتملة مع التعليل البيداغوجي والبرهان المنطقي.

### 3. معيار الجودة والتحكم
الوصول إلى النتيجة الصحيحة في زمن قياسي مع تدوين الخطوات المنهجية الكاملة.`;

  const advanced = `# ورقة الدعم البيداغوجي 3: المستوى المتقدم والتعميق (Advanced)
**الموضوع:** ${topic} | **المادة:** ${subject}
*الهدف التمايزي: تحدي فكري، تنمية التفكير النقدي، والقدرة على التركيب وحل المشكلات المركبة.*

### 1. وضعية إشكالية مركبة (Complex Challenge)
مسألة مفتوحة تدمج بين ${topic} ومفاهيم موازية في مادة ${subject} لاختبار قدرة التلميذ على التحويل الإدراكي.

### 2. المهام المتقدمة
- نقد فرضيات بديلة وتفنيد المقاربات غير الدقيقة علمياً.
- اقتراح استراتيجية حل غير تقليدية وصياغة تعميم رياضي أو استنتاج تحليلي معمق.

### 3. آفاق التميز والتفكير المستقبلي
سؤال استشرافي يربط موضوع الدرس بتطبيقات علمية أو واقعية متطورة.`;

  return {
    easy,
    standard,
    advanced,
    fullMarkdown: `${easy}\n\n---\n\n${standard}\n\n---\n\n${advanced}`,
  };
}

/* =========================================================================
   5. SUMMARY & FLASHCARDS GENERATOR
   Input: topic or uploaded text.
   Output: a concise summary paragraph, then JSON flashcards:
   { "flashcards": [ { "front": "", "back": "" } ] }
   ========================================================================= */

export async function generateSummaryAndFlashcards(input: SummaryFlashcardsInput): Promise<SummaryFlashcardsOutput> {
  const { topicOrText, subject = "General", language = "ar", mode = "detailed" } = input;
  const langPrompt = getLanguageInstruction(language);
  const modePrompt = getModeInstruction(mode);

  const prompt = `You are an expert pedagogical summarizer and spaced-repetition study creator.
Generate a concise, high-value pedagogical summary and interactive flashcards for:
- Subject: ${subject}
- Input Topic / Text:
"""
${topicOrText.slice(0, 4000)}
"""
${langPrompt}
${modePrompt}

MANDATORY OUTPUT REQUIREMENTS:
Return valid JSON matching this exact structure with NO markdown or text outside the JSON:
{
  "summary": "A concise, coherent, educational synthesis paragraph capturing the absolute core essence of the topic.",
  "flashcards": [
    {
      "front": "Term, prompt, or targeted question",
      "back": "Clear, precise, memorable definition or answer"
    }
  ]
}

Provide between 6 and 12 distinct, high-yield flashcard pairs covering key terms, mechanisms, and rules.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.25,
        },
      });
      const text = response.text?.trim() || "";
      const cleaned = sanitizeJsonString(text);
      const parsed = JSON.parse(cleaned) as SummaryFlashcardsOutput;
      if (parsed?.summary && Array.isArray(parsed?.flashcards) && parsed.flashcards.length >= 3) {
        return {
          summary: parsed.summary.trim(),
          flashcards: parsed.flashcards.map(f => ({
            front: String(f.front || "").trim(),
            back: String(f.back || "").trim(),
          })),
        };
      }
    } catch (err) {
      console.warn("[TeacherGenerators] Gemini Summary & Flashcards generation error:", err);
    }
  }

  return fallbackSummaryFlashcards(input);
}

function fallbackSummaryFlashcards(input: SummaryFlashcardsInput): SummaryFlashcardsOutput {
  const { topicOrText, subject = "General", language = "ar" } = input;
  const isFr = language === "fr";
  const topicTitle = topicOrText.slice(0, 60).trim();

  if (isFr) {
    return {
      summary: `Ce document traite des composantes essentielles de "${topicTitle}" dans le cadre de la discipline "${subject}". La synthèse met en lumière les principes théoriques fondamentaux, les mécanismes d'application directe et les critères de rigueur méthodologique indispensables pour maîtriser cette unité d'enseignement.`,
      flashcards: [
        { front: `Quel est l'objectif premier de ${topicTitle} ?`, back: `Acquérir la maîtrise opérationnelle et conceptuelle des notions clés de l'unité.` },
        { front: `Définition du concept central`, back: `Principe fondamental servant de socle à toutes les applications pratiques de cette thématique.` },
        { front: `Règle d'application majeure`, back: `Respect scrupuleux des étapes d'analyse avant d'aboutir à la formulation de la réponse.` },
        { front: `Erreur méthodologique fréquente à éviter`, back: `Confondre les conditions initiales avec les résultats déduits de l'observation.` },
        { front: `Outil clé de validation`, back: `Vérification systématique de la cohérence interne du résultat obtenu.` },
        { front: `Application interdisciplinaire`, back: `Mise en relation de ce concept avec les unités d'apprentissage connexes du cursus.` },
      ],
    };
  }

  return {
    summary: `يستعرض هذا المضمون التعليمي المفاصل الجوهرية لموضوع "${topicTitle}" ضمن مادة ${subject}. يركز الملخص على إبراز القواعد المعرفية الحاكمة، وتوضيح تسلسل المفاهيم من المكتسبات القبلية إلى الكفاءات الختامية، مما يمكن المتعلم من بناء استيعاب متين ومنظم يسهل استرجاعه وتطبيقه في الوضعيات الاختبارية.`,
    flashcards: [
      { front: `ما هو المفهوم المحوري في "${topicTitle}"؟`, back: `الركيزة البيداغوجية الأساسية التي تبنى عليها كافة التطبيقات والتمارين في هذه الوحدة.` },
      { front: `ما هي الشروط المنهجية لتطبيق القاعدة؟`, back: `توفر المعطيات الأولية واستيفاء مراحل التحليل والاستدلال المعتمدة بيداغوجياً.` },
      { front: `ما هو الخطأ الشائع الذي ينبغي تجنبه؟`, back: `التسرع في استنتاج النتيجة دون المرور بالخطوات التبريرية المقررة في المنهج.` },
      { front: `كيف يمكن التحقق الذاتي من صحة الإجابة؟`, back: `مطابقة النتيجة المستخلصة مع الشروط النظرية ومؤشرات النجاح المحددة في الدرس.` },
      { front: `ما هي الدلالة التطبيقية لمصطلحات الوحدة؟`, back: `توظيفها بدقة في حل المسائل المنهجية والوضعية الإدماجية التقييمية.` },
      { front: `ما الرابط بين هذا المفهوم والوحدات الموالية؟`, back: `يشكل هذا المحور منطلقاً بنيوياً لمواصلة التدرج المعرفي في المقرر الدراسي.` },
    ],
  };
}

/* =========================================================================
   6. HOMEWORK SHEET GENERATOR
   Input: subject, topic, grade level.
   Output: Markdown with sections:
   Objective, Instructions, Exercises, Estimated Duration, Submission Guidelines.
   ========================================================================= */

export async function generateHomeworkSheet(input: HomeworkInput): Promise<string> {
  const { subject, topic, gradeLevel, language = "ar", mode = "detailed" } = input;
  const langPrompt = getLanguageInstruction(language);
  const modePrompt = getModeInstruction(mode);

  const prompt = `You are an expert curriculum and homework designer.
Generate a formal, high-quality homework sheet (واجب منزلي / تدريب تطبيقي) for:
- Subject: ${subject}
- Topic: ${topic}
- Grade Level: ${gradeLevel}
${langPrompt}
${modePrompt}

MANDATORY OUTPUT REQUIREMENTS:
Output MUST be formatted in clean Markdown and MUST contain exactly these 5 designated sections:
## 1. Objective
## 2. Instructions
## 3. Exercises
## 4. Estimated Duration
## 5. Submission Guidelines

(If language is Arabic, include Arabic equivalents, e.g. "## 1. Objective | الهدف التعلمي").
Ensure:
- The exercises are substantive and graduated in difficulty (e.g. Exercise 1: Foundation; Exercise 2: Application; Exercise 3: Challenge).
- The estimated duration and submission deadlines/guidelines are clear and motivating.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });
      const text = response.text?.trim();
      if (text && text.includes("Objective") && text.includes("Exercises")) {
        return text;
      }
    } catch (err) {
      console.warn("[TeacherGenerators] Gemini Homework generation error:", err);
    }
  }

  return fallbackHomework(input);
}

function fallbackHomework(input: HomeworkInput): string {
  const { subject, topic, gradeLevel, language = "ar" } = input;
  const isFr = language === "fr";

  if (isFr) {
    return `# Devoir à la Maison : ${topic}
**Discipline :** ${subject} | **Niveau :** ${gradeLevel}

## 1. Objective
Permettre à l'élève d'ancrer les compétences travaillées en classe sur "${topic}", de développer son autonomie de travail personnel et de vérifier sa capacité à mobiliser les démarches de ${subject}.

## 2. Instructions
- Travaillez sur feuille double propre ou sur votre cahier de devoirs.
- Lisez attentivement chaque consigne avant de rédiger vos réponses.
- Justifiez systématiquement vos calculs et vos raisonnements.
- Rédigez avec soin dans un français correct et soigné.

## 3. Exercises

### Exercice 1 : Maîtrise des Fondamentaux (6 points)
1. Définissez avec précision les deux termes clés du sujet "${topic}".
2. Citez deux conditions indispensables à la mise en œuvre de la règle principale.
3. Donnez un exemple d'application directe validant le cours.

### Exercice 2 : Application & Analyse Documentaire (8 points)
À partir de la situation étudiée en classe :
1. Analysez les données fournies et identifiez les variables pertinentes.
2. Développez une démarche structurée en 3 étapes pour répondre à la problématique.
3. Concluez en déduisant la conséquence immédiate sur le système étudié.

### Exercice 3 : Défi d'Approfondissement (6 points)
Proposez une solution argumentée pour résoudre le cas particulier où les conditions habituelles ne sont pas réunies. Comparez votre démarche avec un cas réel.

## 4. Estimated Duration
**45 à 60 minutes** (Prévoyez une relecture attentive de 5 minutes).

## 5. Submission Guidelines
- **Date limite de remise :** À rendre au début de la prochaine séance de cours.
- **Modalités :** Remise de la copie papier en main propre ou dépôt sur la plateforme numérique autorisée.
- **Barème :** Noté sur 20 points (la clarté de la présentation compte pour 2 points).`;
  }

  return `# بطاقة الواجب المنزلي: ${topic}
**المادة:** ${subject} | **المستوى الدراسي:** ${gradeLevel}

## 1. Objective | الهدف التعلمي
ترسيخ المكتسبات المعرفية والمهارية لحصة "${topic}"، وتدريب المتعلم على الممارسة الفردية المستقلة، وقياس مدى جاهزيته للمحطات التقييمية القادمة في مادة ${subject}.

## 2. Instructions | التوجيهات والتعليمات العامة
- الإنجاز الفردي على ورقة مزدوجة منظمة أو في الدفتر المخصص للواجبات.
- قراءة نص التمارين قراءة متأنية وتحديد الكلمات المفتاحية في كل سؤال.
- تعليل الإجابات والبرهنة المنطقية وعدم الاكتفاء بالنتائج الرقمية أو الاسمية المجردة.
- العناية بنظافة الخط وسلامة التعبير باللغة العربية الفصحى.

## 3. Exercises | التمارين التطبيقية المتدرجة

### التمرين الأول: استرجاع وتنظيم المعارف (06 نقاط)
1. عرّف المفاهيم الأساسية المرتبطة بموضوع "${topic}" بدقة علمية.
2. اذكر قاعدتين أساسيتين يجب مراعاتهما عند تطبيق هذه المفاهيم في ${subject}.
3. صحح الخطأ الوارد في العبارة النموذجية وقدم التبرير المناسب.

### التمرين الثاني: تطبيق المنهجية وحل المشكلات (08 نقاط)
بناءً على المعطيات المعرفية المتناولة في القسم:
1. استخرج المعطيات الأساسية والمؤشرات الدالة من السند المقترح.
2. اتبع خطوات الحل المنظم للإجابة عن الإشكالية المطروحة بالبرهان الرياضي أو اللغوي السليم.
3. حرر استنتاجاً علمياً مركزاً يربط النتيجة بالهدف المنشود.

### التمرين الثالث: وضعية إدماج وتحدي فكري (06 نقاط)
طرح مسألة مفتوحة تتطلب الربط بين معارف "${topic}" ومكتسبات قبلية سابقة، مع كتابة فقرة تعليلية متماسكة توضح طريقة التفكير الإبداعي المتبعة.

## 4. Estimated Duration | المدة الزمنية المقدرة
**45 إلى 60 دقيقة** كحد أقصى لإنجاز التمارين مع مراجعة ختامية لمدة 5 دقائق.

## 5. Submission Guidelines | إرشادات التسليم والتقييم
- **موعد التسليم:** يسلم الواجب في بداية الحصة القادمة مباشرة للأستاذ.
- **طريقة التسليم:** نسخة ورقية أصلية مرتبة ومنسقة.
- **سلم التنقيط:** الواجب مقوّم على 20 نقطة (تُخصص نقطتان لحسن التنظيم ونظافة الورقة).`;
}

/* =========================================================================
   7. SECTION-LEVEL REGENERATION
   For Lesson Notes (10 sections) & Support Sheets (3 tiers: Easy, Standard, Advanced)
   ========================================================================= */

export async function regenerateSingleSection(input: RegenerateSectionInput): Promise<string> {
  const { generatorType, sectionKey, sectionTitle, subject, topic, gradeLevel, fullContext, language = "ar", mode = "detailed" } = input;
  const langPrompt = getLanguageInstruction(language);
  const modePrompt = getModeInstruction(mode);

  const prompt = `You are an expert pedagogical editor.
The teacher is requesting to REGENERATE A SINGLE SPECIFIC SECTION of an educational document while keeping it consistent with the existing material.

Context:
- Document Type: ${generatorType === "lesson_notes" ? "10-Section Lesson Plan" : "3-Tier Differentiated Support Sheets"}
- Section to Regenerate: "${sectionTitle}" (Key: ${sectionKey})
- Subject: ${subject}
- Topic: ${topic}
${gradeLevel ? `- Grade Level: ${gradeLevel}` : ""}
${langPrompt}
${modePrompt}

Existing Document Context (for coherence):
"""
${(fullContext || "").slice(0, 1500)}
"""

REQUIREMENT:
Output ONLY the regenerated, fresh content for this single section "${sectionTitle}".
Do NOT output the other sections.
Make it fresh, pedagogically rich, engaging, and directly applicable.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.4,
        },
      });
      const text = response.text?.trim();
      if (text) return text;
    } catch (err) {
      console.warn("[TeacherGenerators] Gemini single section regeneration error:", err);
    }
  }

  if (language === "fr") {
    return `### ${sectionTitle} (Régénéré)
- Approche actualisée et enrichie pour ${topic} (${subject}).
- Renforcement des démarches actives et de l'interactivité en classe.
- Focus sur la remédiation immédiate et la différenciation pédagogique ciblée.`;
  }

  return `### ${sectionTitle} (نسخة متجددة ومطورة)
- صياغة بيداغوجية حديثة ومثرية لموضوع "${topic}" في مادة ${subject}.
- تعزيز الأنشطة التفاعلية واستراتيجيات التعلم النشط وبناء الكفاءات الذاتية.
- ضبط مؤشرات النجاح والتقويم التكويني المستمر لضمان استيعاب كافة الفئات الطلابية.`;
}
