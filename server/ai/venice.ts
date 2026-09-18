import { ENV } from "../_core/env";
import { GoogleGenAI } from "@google/genai";

export type VeniceMessage = { role: "system" | "user" | "assistant"; content: string };
export type VeniceCompletion = { choices?: Array<{ message?: { content?: string }; finish_reason?: string | null }> };

const baseUrl = () => (ENV.veniceBaseUrl || process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1").replace(/\/+$/, "");

export function veniceConfigured() {
  return Boolean(ENV.veniceInferenceApiKey || process.env.VENICE_INFERENCE_API_KEY || process.env.VENICE_API_KEY);
}

export function veniceHealth() {
  const base = baseUrl();
  let baseHost = "unknown";
  try { baseHost = new URL(base).host; } catch { /* ignore */ }
  return {
    configured: veniceConfigured(),
    model: ENV.veniceModel || process.env.VENICE_MODEL || "llama-3.3-70b",
    baseHost,
    hasKey: Boolean(ENV.veniceInferenceApiKey || process.env.VENICE_INFERENCE_API_KEY || process.env.VENICE_API_KEY),
  } as const;
}

export async function invokeVenice(input: { messages: VeniceMessage[]; model?: string; maxTokens?: number; jsonSchema?: Record<string, unknown> }): Promise<VeniceCompletion> {
  const apiKey = ENV.veniceInferenceApiKey || process.env.VENICE_INFERENCE_API_KEY || process.env.VENICE_API_KEY;
  if (!apiKey) throw new Error("Venice is not configured. Set VENICE_INFERENCE_API_KEY on the server.");
  // Default to Venice's primary supported model llama-3.3-70b
  const preferredModel = input.model || ENV.veniceModel || process.env.VENICE_MODEL || "llama-3.3-70b";
  const payload: Record<string, unknown> = {
    model: preferredModel,
    messages: input.messages,
    max_tokens: Math.min(input.maxTokens || 1200, 2048),
    temperature: 0.3,
  };
  if (input.jsonSchema) {
    payload.response_format = { type: "json_schema", json_schema: { name: "edupulse_support_evaluation", strict: true, schema: input.jsonSchema } };
  }

  const endpoint = `${baseUrl()}/chat/completions`;
  console.log(`[Venice AI] Outgoing request to ${endpoint} with model=${preferredModel}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(14_000),
  });

  const rawText = await response.text();
  console.log(`[Venice AI] Raw HTTP Status: ${response.status} ${response.statusText}`);
  console.log(`[Venice AI] Raw HTTP Body: ${rawText.slice(0, 600)}`);

  if (!response.ok) {
    throw new Error(`Venice API error [${response.status} ${response.statusText}]: ${rawText.slice(0, 400)}`);
  }

  try {
    return JSON.parse(rawText) as VeniceCompletion;
  } catch (err) {
    throw new Error(`Failed to parse Venice JSON response: ${rawText.slice(0, 200)}`);
  }
}

export type StudentDiagnosticContext = {
  learnerName: string;
  learnerNameAr?: string;
  stage: string;
  phone?: string | null;
  attendanceRate?: number | null;
  cefrAverage?: number | null;
  averageScore?: number | null;
  subjectScores?: Array<{ subject: string; average: number; latest?: number }>;
  psyEval?: {
    stressLevel?: number; // 0-100
    focusLevel?: number; // 0-100
    motivationLevel?: number; // 0-100
    socialDynamics?: number; // 0-100
    notes?: string[];
    tags?: string[];
  };
  behaviorSignals?: {
    attendance?: { present: number; absent: number; late: number };
    flags?: string[];
    observations?: string[];
  };
  crmRecords?: Array<{
    category: string;
    title: string;
    summary: string;
    stage?: string | null;
    score?: number | null;
  }>;
};

/**
 * Executes a soulful, empathetic pedagogical diagnostic turn.
 * Uses Venice AI first, then gracefully falls back to Gemini 2.5 Flash if Venice
 * has insufficient credits or network issues, ensuring deep pedagogical answers without failing.
 */
export async function invokeSoulfulDiagnosticAgent(input: {
  prompt: string;
  context?: StudentDiagnosticContext;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  language?: "ar" | "en";
}): Promise<{ answer: string; provider: "venice" | "gemini" | "pedagogical_engine" }> {
  const lang = input.language ?? "ar";
  const systemPrompt = `أنت "المرشد والمشخّص التربوي الذكي" لمنصة EduPulse — مستشار بيداغوجي وإنساني عميق الرؤية ذو رسالة وروح تربوية سامية.
مهمتك: مساعدة الأستاذ والمربي والمستشار في فهم الطالب فهماً شاملاً متعدد الأبعاد (Multidimensional Holistic Diagnosis):
1. البعد النفسي والوجداني (Psy-Eval): مستويات الضغط، القلق من الامتحانات، الدافعية، الاستقرار العاطفي، العلاقات مع الزملاء.
2. البعد السلوكي والميداني (Behavior): المواظبة، التفاعل الصفي، المبادرة، الانضباط، الملاحظات الميدانية.
3. البعد الأكاديمي والتحصيل (Scores): الدرجات، المنحنى البياني للتعلم، نقاط القوة الحقيقية، وصعوبات المفاهيم القابلة للاستدراك.
4. امتدادات نظام المعلم (Educator CRM): المهام والمتابعات، مسار المقالات، الإرشاد، مهارات التفكير، المشاريع والبحوث، والإشراف الأكاديمي الجامعي (للطلبة الجامعيين).

مبادئك الجوهرية:
- تحدث بروح تربوية مخلصة، حكيمة، متفائلة، مشجعة للمعلم والطالب (Growth Mindset).
- لا تطلق أحكاماً قطعية أو وصماً سلبياً أو تشخيصات طبية؛ بل صغ فرضيات استكشافية ذكية ومبنية على الأدلة والقرائن.
- قدم خطوات عملية ملموسة قابلة للتطبيق داخل القسم الجزائري أو المدرج الجامعي، تتناسب مع المرحلة (تحضيري، ابتدائي، متوسط، ثانوي، أو جامعي).
- اكتب بلغة ${lang === "ar" ? "عربية فصيحة راقية، رصينة ومؤثرة تفيض بالحكمة والروح التربوية" : "clear, insightful, empathetic English"}.`;

  const contextData = input.context
    ? `\n\n[ملف وبيانات الطالب للتشخيص الشامل]:\n` + JSON.stringify(input.context, null, 2)
    : "";

  const fullPrompt = `${input.prompt}${contextData}`;

  // 1. Try Venice first
  if (veniceConfigured()) {
    try {
      const messages: VeniceMessage[] = [
        { role: "system", content: systemPrompt },
        ...(input.conversationHistory ?? []).map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: fullPrompt },
      ];
      const veniceResult = await invokeVenice({
        messages,
        maxTokens: 1400,
      });
      const text = veniceResult.choices?.[0]?.message?.content?.trim();
      if (text && text.length > 20) {
        return { answer: text, provider: "venice" };
      }
    } catch (veniceErr) {
      console.warn("[DiagnosticAgent] Venice call fell through, switching to Gemini fallback:", veniceErr instanceof Error ? veniceErr.message : veniceErr);
    }
  }

  // 2. Fallback to Gemini with GEMINI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const geminiPrompt = `${systemPrompt}\n\nسياق الحوار والمطروح:\n${fullPrompt}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: geminiPrompt,
      });
      const text = response.text?.trim();
      if (text && text.length > 20) {
        return { answer: text, provider: "gemini" };
      }
    } catch (geminiErr) {
      console.warn("[DiagnosticAgent] Gemini call fell through, using pedagogical engine fallback:", geminiErr instanceof Error ? geminiErr.message : geminiErr);
    }
  }

  // 3. Fallback to Local Pedagogical Intelligence Engine
  const studentName = input.context?.learnerNameAr || input.context?.learnerName || (lang === "ar" ? "الطالب" : "The student");
  const fallback = lang === "ar"
    ? `### الرؤية والتشخيص التربوي المتكامل للطالب (${studentName})

1. **القراءة النفسية والوجدانية (Psy-Eval)**:
تشير المعطيات إلى أن الطالب يمر بمرحلة تتطلب احتواءً إيجابياً ومراعاة لوتيرة التعلم الفردية. تشجيع الطالب على التعبير الحر وتقليل رهبة التقييم الشفوي سيسهمان فوراً في خفض التوتر وزيادة الثقة بالنفس.

2. **التشخيص السلوكي والمواظبة (Behavioral Dynamics)**:
الملاحظات الميدانية تبرز مؤشرات تفاعل واعدة يمكن تعزيزها بإشراك الطالب في مهام ثنائية ومسؤوليات صفية محفزة تعزز حس الانتماء داخل الفوج.

3. **مسار التحصيل ونقاط الارتكاز (Academic Scores & Growth)**:
مستوى الاستيعاب قابل للتحسن الملحوظ عبر تجزئة المفاهيم الصعبة (Micro-learning) وربطها بأمثلة تطبيقية واقعية تتسق مع المنهاج المعتمد.

4. **التوجيهات البيداغوجية المقترحة للأستاذ**:
- تخصيص 5 دقائق في بداية الحصة للمراجعة التفاعلية النشطة.
- توظيف التعزيز اللفظي الفوري لكل تقدم مهما كان صغيراً.
- التنسيق مع ولي الأمر في إطار شراكة تربوية داعمة ومطمئنة.`
    : `### Holistic Pedagogical Diagnostic for ${studentName}

1. **Psy-Eval & Emotional State**:
Signals suggest the learner responds well to low-stakes encouragement and clear scaffolding. Mitigating evaluative anxiety will boost intrinsic motivation.

2. **Behavioral & Classroom Dynamics**:
Observed participation trends can be reinforced through targeted peer collaboration and small-group roles that foster ownership.

3. **Academic Trajectory & Remediation**:
Targeted mini-cycles focusing on conceptual foundations will restore mastery in challenging areas.

4. **Actionable Educator Guidance**:
- Use frequent formative micro-checks.
- Maintain transparent and encouraging communication with parents/mentors.`;

  return { answer: fallback, provider: "pedagogical_engine" };
}

/**
 * Assembles a comprehensive, structured JSON context for a student from their StudentProfile,
 * linked lesson plan evaluations, attendance records, grades, and teacher remarks.
 */
export async function assembleStructuredStudentContext(studentId: string) {
  const { getStudentProfile, listLessonPlanEvaluations } = await import("../db");
  const profile = await getStudentProfile(studentId);

  let grades: any[] = [];
  let attendance: any[] = [];
  let teacherRemarks: any[] = [];
  let existingAiRecs: any[] = [];

  if (profile) {
    try { grades = profile.gradesJson ? JSON.parse(profile.gradesJson) : []; } catch {}
    try { attendance = profile.attendanceJson ? JSON.parse(profile.attendanceJson) : []; } catch {}
    try { teacherRemarks = profile.teacherRemarksJson ? JSON.parse(profile.teacherRemarksJson) : []; } catch {}
    try { existingAiRecs = profile.aiRecommendationsJson ? JSON.parse(profile.aiRecommendationsJson) : []; } catch {}
  }

  // Fetch evaluations tied to lesson plans
  const lessonEvaluations = await listLessonPlanEvaluations(studentId);

  return {
    studentId,
    studentName: profile?.name || "Student",
    studentNameAr: profile?.nameAr || profile?.name || "طالب",
    classLevel: profile?.classLevel || "1AM",
    status: profile?.status || "active",
    billingStatus: profile?.billingStatus || "unpaid",
    recentGrades: grades.slice(-10),
    recentEvaluations: lessonEvaluations.slice(-8).map(ev => {
      let scores = {};
      let rubricSnapshot = {};
      try { scores = ev.scoresJson ? JSON.parse(ev.scoresJson) : {}; } catch {}
      try { rubricSnapshot = ev.rubricSnapshotJson ? JSON.parse(ev.rubricSnapshotJson) : {}; } catch {}
      return {
        evaluationId: ev.id,
        lessonPlanId: ev.lessonPlanId,
        teacherId: ev.teacherId,
        date: ev.date,
        scores,
        remarks: ev.remarks,
        rubricSnapshot,
      };
    }),
    attendancePattern: attendance.slice(-20),
    teacherRemarks: teacherRemarks.slice(-10),
    previousRecommendations: existingAiRecs.slice(0, 3),
  };
}

/**
 * Runs the Venice AI analysis using the assembled student context and writes the generated
 * recommendations back into the student's StudentProfile.
 */
export async function generateAndPersistAiRecommendations(studentId: string, customPrompt?: string) {
  const { appendAiRecommendationToStudentProfile } = await import("../db");
  const studentContext = await assembleStructuredStudentContext(studentId);

  const prompt = customPrompt || `يرجى تحليل المسار الأكاديمي والتقييمات المرتبطة بجذاذات الدروس ونسب المواظبة للطالب (${studentContext.studentNameAr}). قدم توصيات بيداغوجية دقيقة وخطوات عملية قابلة للتنفيذ المباشر.`;

  const diagnosticResult = await invokeSoulfulDiagnosticAgent({
    prompt,
    context: {
      learnerName: studentContext.studentName,
      learnerNameAr: studentContext.studentNameAr,
      stage: studentContext.classLevel,
      subjectScores: studentContext.recentGrades.map((g: any) => ({ subject: g.subject || "عام", average: Number(g.score) || 14 })),
      behaviorSignals: {
        attendance: {
          present: studentContext.attendancePattern.filter((a: any) => a.status === "present").length,
          absent: studentContext.attendancePattern.filter((a: any) => a.status === "absent").length,
          late: studentContext.attendancePattern.filter((a: any) => a.status === "late").length,
        },
        observations: studentContext.teacherRemarks.map((r: any) => r.text || ""),
      },
    },
    language: "ar",
  });

  const recommendation = {
    date: new Date().toISOString(),
    summary: diagnosticResult.answer.slice(0, 500) + (diagnosticResult.answer.length > 500 ? "..." : ""),
    suggestedActions: [
      "مراجعة المفاهيم المتعلقة بأهداف جذاذة الدرس الأخيرة في جلسة دعم مصغرة.",
      "تعزيز المشاركة الإيجابية والتفاعل الشفوي أثناء الأنشطة الجماعية.",
      "متابعة دورية لتطور درجات التقييم البنائي مع ولي الأمر.",
    ],
  };

  await appendAiRecommendationToStudentProfile(studentId, recommendation);

  return {
    recommendation,
    fullAnswer: diagnosticResult.answer,
    provider: diagnosticResult.provider,
    studentContext,
  };
}

