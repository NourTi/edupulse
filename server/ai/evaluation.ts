import { invokeVenice, veniceConfigured } from "./venice";

type Assessment = { subject: string; score: number; assessmentType: string; assessedAt: Date | string };
type Attendance = { status: string };
type Cefr = { level: string; speaking: number; listening: number; reading: number; writing: number };
type RecordItem = { category: string; title: string; summary: string; score: number | null };

const schema = { type: "object", properties: { summary: { type: "string" }, factors: { type: "array", items: { type: "string" } }, recommendations: { type: "array", items: { type: "string" } } }, required: ["summary", "factors", "recommendations"], additionalProperties: false };

export async function buildSupportEvaluation(input: { stage: string; assessments: Assessment[]; attendance: Attendance[]; cefr: Cefr[]; records: RecordItem[]; language: "ar" | "en"; useAi?: boolean }) {
  const bySubject = new Map<string, number[]>();
  for (const item of input.assessments) bySubject.set(item.subject, [...(bySubject.get(item.subject) || []), item.score]);
  const subjectTrends = Array.from(bySubject.entries()).map(([subject, scores]) => ({ subject, average: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length), latest: scores.at(-1) ?? 0, assessments: scores.length }));
  const average = subjectTrends.length ? Math.round(subjectTrends.reduce((sum, item) => sum + item.average, 0) / subjectTrends.length) : null;
  const absences = input.attendance.filter(item => item.status === "absent").length;
  const late = input.attendance.filter(item => item.status === "late").length;
  const attendanceRate = input.attendance.length ? Math.round(((input.attendance.length - absences) / input.attendance.length) * 100) : null;
  const cefrAverage = input.cefr.length ? Math.round(input.cefr.reduce((sum, item) => sum + item.speaking + item.listening + item.reading + item.writing, 0) / (input.cefr.length * 4)) : null;
  const weakSubjects = subjectTrends.filter(item => item.average < 50).map(item => item.subject);
  const strongSubjects = subjectTrends.filter(item => item.average >= 75).map(item => item.subject);
  const supportLevel: "progressing" | "needs_support" | "urgent_review" = average !== null && average < 40 || (attendanceRate !== null && attendanceRate < 75) ? "urgent_review" : average !== null && average < 60 ? "needs_support" : "progressing";
  // confidence and completeness help the teacher gauge how much to trust this aid
  const totalSignals = input.assessments.length + input.attendance.length + input.cefr.length + input.records.length;
  const hasAssessments = input.assessments.length >= 3;
  const hasAttendance = input.attendance.length >= 5;
  const hasCefr = input.cefr.length >= 1;
  const missingSignals: string[] = [];
  if (!hasAssessments) missingSignals.push(input.language === "ar" ? "قلة التقييمات الأخيرة" : "few recent assessments");
  if (!hasAttendance) missingSignals.push(input.language === "ar" ? "بيانات حضور محدودة" : "limited attendance data");
  if (!hasCefr && input.stage !== "preparatory") missingSignals.push(input.language === "ar" ? "تقييم CEFR غير متوفر" : "CEFR not yet recorded");
  if (!input.records.length) missingSignals.push(input.language === "ar" ? "لا توجد ملاحظات سلوكية أو إشرافية" : "no behavior/supervision notes");
  const dataCompleteness = Math.round(((hasAssessments ? 1 : 0) + (hasAttendance ? 1 : 0) + (hasCefr ? 1 : 0) + (input.records.length ? 1 : 0)) / 4 * 100);
  const confidence: "low" | "medium" | "high" = totalSignals < 4 ? "low" : totalSignals < 10 || missingSignals.length >= 2 ? "medium" : "high";
  const evidence = { stage: input.stage, subjectTrends, averageScore: average, attendanceRate, absences, late, cefrAverage, strongSubjects, weakSubjects, recordSignals: input.records.slice(0, 12).map(item => ({ category: item.category, title: item.title, summary: item.summary.slice(0, 500), score: item.score })), confidence, missingSignals, dataCompleteness, totalSignals };
  let summary = input.language === "ar" ? "تقييم دعم تعليمي مبني على السجلات المتاحة، ويحتاج إلى مراجعة المعلم." : "An educational support review based on available records; teacher review is required.";
  let factors = weakSubjects.length ? [`Lower recent performance in: ${weakSubjects.join(", ")}`] : [];
  if (attendanceRate !== null && attendanceRate < 85) factors.push(`Attendance signal: ${attendanceRate}% present, with ${absences} absence(s) and ${late} late arrival(s).`);
  if (cefrAverage !== null && cefrAverage < 55) factors.push(input.language === "ar" ? `إشارة لغوية CEFR: متوسط ${cefrAverage}%` : `Language CEFR signal: average ${cefrAverage}%`);
  if (!factors.length) factors = [input.language === "ar" ? "لا توجد إشارة واحدة قوية تفسر النتيجة." : "No single contributing signal was strong enough to explain the result."];
  if (missingSignals.length) factors.push(input.language === "ar" ? `تحذير اكتمال: ${missingSignals.join("، ")}` : `Completeness warning: ${missingSignals.join(", ")}`);
  let recommendations = weakSubjects.length ? (input.language === "ar" ? ["مراجعة أعمال حديثة لتحديد المفاهيم المفقودة.", "اعتماد دورة تدريب قصيرة موجهة وإعادة تقييم خلال أسبوعين."] : ["Review recent work for misconceptions.", "Use a short targeted practice cycle and reassess within two weeks."]) : (input.language === "ar" ? ["مواصلة الدعم الحالي ومراجعة اتجاه التقييم القادم."] : ["Continue current support and review the next assessment trend."]);
  let usedVenice = false;
  if (input.useAi !== false && veniceConfigured()) {
    try {
      const response = await invokeVenice({ model: "llama-3.3-70b", maxTokens: 700, messages: [{ role: "system", content: `You are EduPulse's educational support assistant. Respond in ${input.language === "ar" ? "clear Arabic" : "clear English"}. Use only the JSON evidence supplied (including missingSignals and confidence). Do not diagnose mental health, intelligence, personality, family problems, disability, or medical conditions. Do not call a learner bad. Describe signals as hypotheses, cite the evidence in plain language, list strengths before gaps, recommend practical teacher actions, state confidence (${confidence}) and missing data, and say teacher review is required. Return only JSON.` }, { role: "user", content: JSON.stringify(evidence) }], jsonSchema: schema });
      const raw = response.choices?.[0]?.message?.content;
      if (typeof raw === "string") { const parsed = JSON.parse(raw) as { summary?: string; factors?: string[]; recommendations?: string[] }; if (parsed.summary && Array.isArray(parsed.factors) && Array.isArray(parsed.recommendations)) { summary = parsed.summary.slice(0, 3000); factors = parsed.factors.slice(0, 8).map(String); recommendations = parsed.recommendations.slice(0, 8).map(String); usedVenice = true; } }
    } catch { /* Local evidence remains the safe fallback. */ }
  }
  return { supportLevel, evidence, factors, recommendations, summary, usedVenice, confidence, missingSignals, dataCompleteness };
}
