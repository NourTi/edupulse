import { invokeVenice, veniceConfigured, invokeSoulfulDiagnosticAgent } from "./venice";

type Assessment = { subject: string; score: number; assessmentType: string; assessedAt: Date | string };
type Attendance = { status: string };
type Cefr = { level: string; speaking: number; listening: number; reading: number; writing: number };
type RecordItem = { category: string; title: string; summary: string; score: number | null; stage?: string | null };

const schema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    factors: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    psyEvalSummary: { type: "string" },
    behaviorSummary: { type: "string" },
  },
  required: ["summary", "factors", "recommendations"],
  additionalProperties: false,
};

export async function buildSupportEvaluation(input: {
  stage: string;
  assessments: Assessment[];
  attendance: Attendance[];
  cefr: Cefr[];
  records: RecordItem[];
  language: "ar" | "en";
  useAi?: boolean;
  learnerName?: string;
}) {
  const bySubject = new Map<string, number[]>();
  for (const item of input.assessments) bySubject.set(item.subject, [...(bySubject.get(item.subject) || []), item.score]);
  const subjectTrends = Array.from(bySubject.entries()).map(([subject, scores]) => ({
    subject,
    average: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
    latest: scores.at(-1) ?? 0,
    assessments: scores.length,
  }));
  const average = subjectTrends.length ? Math.round(subjectTrends.reduce((sum, item) => sum + item.average, 0) / subjectTrends.length) : null;
  const absences = input.attendance.filter(item => item.status === "absent").length;
  const late = input.attendance.filter(item => item.status === "late").length;
  const attendanceRate = input.attendance.length ? Math.round(((input.attendance.length - absences) / input.attendance.length) * 100) : null;
  const cefrAverage = input.cefr.length ? Math.round(input.cefr.reduce((sum, item) => sum + item.speaking + item.listening + item.reading + item.writing, 0) / (input.cefr.length * 4)) : null;
  const weakSubjects = subjectTrends.filter(item => item.average < 50).map(item => item.subject);
  const strongSubjects = subjectTrends.filter(item => item.average >= 75).map(item => item.subject);

  // Group CRM records into holistic diagnostic categories
  const behaviorRecords = input.records.filter(r => r.category === "behavior");
  const mentorshipRecords = input.records.filter(r => r.category === "mentorship");
  const intellectualRecords = input.records.filter(r => r.category === "intellectual_skill");
  const essayRecords = input.records.filter(r => r.category === "essay");
  const projectRecords = input.records.filter(r => r.category === "project" || r.category === "supervision");
  const achievementRecords = input.records.filter(r => r.category === "achievement");

  const supportLevel: "progressing" | "needs_support" | "urgent_review" =
    (average !== null && average < 40) || (attendanceRate !== null && attendanceRate < 75)
      ? "urgent_review"
      : (average !== null && average < 60)
        ? "needs_support"
        : "progressing";

  // confidence and completeness help the teacher gauge how much to trust this aid
  const totalSignals = input.assessments.length + input.attendance.length + input.cefr.length + input.records.length;
  const hasAssessments = input.assessments.length >= 3;
  const hasAttendance = input.attendance.length >= 5;
  const hasCefr = input.cefr.length >= 1;
  const missingSignals: string[] = [];
  if (!hasAssessments) missingSignals.push(input.language === "ar" ? "قلة التقييمات الأخيرة" : "few recent assessments");
  if (!hasAttendance) missingSignals.push(input.language === "ar" ? "بيانات حضور محدودة" : "limited attendance data");
  if (!hasCefr && input.stage !== "preparatory" && !input.stage.includes("higher") && !input.stage.includes("university")) {
    missingSignals.push(input.language === "ar" ? "تقييم CEFR غير متوفر" : "CEFR not yet recorded");
  }
  if (!input.records.length) missingSignals.push(input.language === "ar" ? "لا توجد سجلات سلوكية أو إرشادية في نظام المعلم" : "no behavior/CRM records");

  const dataCompleteness = Math.round(
    ((hasAssessments ? 1 : 0) + (hasAttendance ? 1 : 0) + (hasCefr ? 1 : 0) + (input.records.length ? 1 : 0)) / 4 * 100
  );
  const confidence: "low" | "medium" | "high" = totalSignals < 4 ? "low" : totalSignals < 10 || missingSignals.length >= 2 ? "medium" : "high";

  const evidence = {
    stage: input.stage,
    subjectTrends,
    averageScore: average,
    attendanceRate,
    absences,
    late,
    cefrAverage,
    strongSubjects,
    weakSubjects,
    behaviorCount: behaviorRecords.length,
    mentorshipCount: mentorshipRecords.length,
    intellectualCount: intellectualRecords.length,
    projectCount: projectRecords.length,
    achievementCount: achievementRecords.length,
    recordSignals: input.records.slice(0, 16).map(item => ({
      category: item.category,
      title: item.title,
      summary: item.summary.slice(0, 500),
      score: item.score,
      stage: item.stage,
    })),
    confidence,
    missingSignals,
    dataCompleteness,
    totalSignals,
  };

  let summary = input.language === "ar"
    ? `تقييم دعم تربوي وتشخيص شامل للمتعلم في مرحلة (${input.stage}) يرتكز على سجلات التحصيل والسلوك ونظام المعلم الميداني.`
    : "Comprehensive educational diagnostic based on student PR dossier, academic progress, and educator CRM records.";

  let factors: string[] = [];
  if (weakSubjects.length) factors.push(input.language === "ar" ? `تراجع في تحصيل مواد: ${weakSubjects.join("، ")}` : `Lower recent performance in: ${weakSubjects.join(", ")}`);
  if (strongSubjects.length) factors.push(input.language === "ar" ? `نقاط ارتكاز وتفوق في: ${strongSubjects.join("، ")}` : `Demonstrated mastery in: ${strongSubjects.join(", ")}`);
  if (attendanceRate !== null && attendanceRate < 85) factors.push(input.language === "ar" ? `معدل المواظبة: ${attendanceRate}% مع ${absences} غياب و ${late} تأخر.` : `Attendance signal: ${attendanceRate}% present, with ${absences} absence(s) and ${late} late arrival(s).`);
  if (cefrAverage !== null && cefrAverage < 55) factors.push(input.language === "ar" ? `إشارة لغوية CEFR: متوسط ${cefrAverage}%` : `Language CEFR signal: average ${cefrAverage}%`);
  if (behaviorRecords.length) factors.push(input.language === "ar" ? `تم رصد ${behaviorRecords.length} ملاحظة سلوكية في نظام المعلم.` : `${behaviorRecords.length} behavioral observation(s) recorded.`);
  if (mentorshipRecords.length) factors.push(input.language === "ar" ? `سجل الإرشاد النفسي (Psy-Eval): يتضمن ${mentorshipRecords.length} جلسة استماع وتوجيه.` : `Psychological & mentorship records include ${mentorshipRecords.length} session(s).`);
  if (!factors.length) factors = [input.language === "ar" ? "لا توجد إشارة واحدة منفردة تفسر النتيجة؛ المعطيات تدل على تقدم متزن." : "Signals indicate stable progress across dimensions."];

  let recommendations: string[] = [];
  if (weakSubjects.length) {
    recommendations.push(input.language === "ar" ? "تحليل المفاهيم المفصلية المفقودة في المواد المتعثرة وتصميم ورشات استدراك مصغرة." : "Identify core missing concepts in lagging subjects with micro-remediation workshops.");
  }
  if (attendanceRate !== null && attendanceRate < 90) {
    recommendations.push(input.language === "ar" ? "متابعة أسباب التأخر والغياب مع الطالب وإشراك ولي الأمر في خطة انتظام تحفيزية." : "Follow up on attendance bottlenecks with an encouraging family communication plan.");
  }
  if (mentorshipRecords.length > 0 || behaviorRecords.length > 0) {
    recommendations.push(input.language === "ar" ? "تفعيل التوجيه الوجداني الإيجابي ودعم الطالب نفسياً لمواجهة قلق الاختبارات." : "Activate positive psychological scaffolding to relieve evaluation anxiety.");
  }
  if (!recommendations.length) {
    recommendations = input.language === "ar"
      ? ["مواصلة خطة المرافقة الحالية، وتكليف الطالب بمشاريع ريادية أو أقرانية لتعزيز التميز.", "جدولة جلسة المتابعة القادمة لتثبيت المكاسب."]
      : ["Maintain current support plan and assign peer leadership tasks.", "Schedule regular progress checkpoints."];
  }

  let usedVenice = false;
  if (input.useAi !== false) {
    try {
      const aiPrompt = input.language === "ar"
        ? `حلل هذا الملف التشخيصي الشامل للطالب (${input.learnerName || "الطالب"}) في مرحلة (${input.stage}). اجمع بين البعد النفسي والوجداني (Psy-Eval)، السلوك والمواظبة (Behavior)، والتحصيل الأكاديمي، وسجلات المعلم (CRM). قدم تقريراً تربوياً حكيماً مفعماً بالروح البيداغوجية والخطوات العملية المحفزة.`
        : `Analyze this comprehensive diagnostic dossier for learner (${input.learnerName || "Learner"}) in stage (${input.stage}). Synthesize Psy-Eval markers, behavior dynamics, academic performance, and educator CRM records. Provide an empathetic, actionable pedagogical plan.`;

      const aiResponse = await invokeSoulfulDiagnosticAgent({
        prompt: aiPrompt,
        context: {
          learnerName: input.learnerName || "Learner",
          learnerNameAr: input.learnerName,
          stage: input.stage,
          averageScore: average,
          attendanceRate,
          cefrAverage,
          subjectScores: subjectTrends,
          crmRecords: input.records,
        },
        language: input.language,
      });

      if (aiResponse.answer && aiResponse.answer.length > 50) {
        summary = aiResponse.answer;
        usedVenice = aiResponse.provider === "venice";
      }
    } catch {
      // Local evidence calculation remains stable fallback
    }
  }

  return {
    supportLevel,
    evidence,
    factors,
    recommendations,
    summary,
    usedVenice,
    confidence,
    missingSignals,
    dataCompleteness,
  };
}

