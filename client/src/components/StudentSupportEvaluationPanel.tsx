import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BrainCircuit,
  CheckCircle2,
  Download,
  Gauge,
  Loader2,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  UserPlus,
  Tag,
  Sliders,
  Heart,
  Compass,
  BookmarkCheck,
  GraduationCap,
  Building2,
  Plus,
  Send,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ALGERIA_EDUCATION_STAGES, educationStageLabel } from "@shared/educationStages";
import { AddStudentModal } from "./AddStudentModal";

type Props = { isArabic: boolean };

type Evidence = {
  averageScore?: number | null;
  attendanceRate?: number | null;
  strongSubjects?: string[];
  weakSubjects?: string[];
  subjectTrends?: Array<{ subject: string; average: number; latest?: number; assessments?: number }>;
  confidence?: "low" | "medium" | "high";
  missingSignals?: string[];
  dataCompleteness?: number;
  cefrAverage?: number | null;
  absences?: number;
  late?: number;
  soulfulAnalysis?: {
    holisticArchetype?: string;
    coreStrengths?: string[];
    hiddenPotentials?: string[];
    growthEdges?: string[];
    psychologicalSafetyIndex?: number;
    recommendedPedagogicalApproach?: string;
    compassionateNarrative?: string;
  };
  psyEvalSummary?: string;
  behaviorSummary?: string;
  behaviorCount?: number;
  mentorshipCount?: number;
  intellectualCount?: number;
  essayCount?: number;
  projectCount?: number;
  achievementCount?: number;
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StudentSupportEvaluationPanel({ isArabic }: Props) {
  const [learnerId, setLearnerId] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | "preparatory" | "primary" | "middle" | "secondary" | "higher">("all");
  const [sortBy, setSortBy] = useState<"name" | "stage">("name");
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isCustomRecordOpen, setIsCustomRecordOpen] = useState(false);

  // Quick Labels & Values state
  const [customLabelName, setCustomLabelName] = useState("");
  const [customLabelScore, setCustomLabelScore] = useState(85);
  const [customLabelCategory, setCustomLabelCategory] = useState<"behavior" | "intellectual_skill" | "mentorship" | "supervision">("intellectual_skill");
  const [customLabelNote, setCustomLabelNote] = useState("");

  const learners = trpc.records.learners.useQuery(undefined, { retry: false });
  const assessments = trpc.records.learningAssessments.useQuery({ learnerId }, { enabled: Boolean(learnerId), retry: false });
  const evaluations = trpc.records.supportEvaluations.useQuery({ learnerId }, { enabled: Boolean(learnerId), retry: false });
  const crmRecords = trpc.records.educatorRecords.useQuery(undefined, { enabled: Boolean(learnerId), retry: false });
  const utils = trpc.useUtils();

  const generate = trpc.records.generateSupportEvaluation.useMutation({
    onSuccess: (result) => {
      const providerNote = (result as unknown as { usedVenice?: boolean }).usedVenice
        ? isArabic
          ? "باستخدام Venice AI المتقدم"
          : "with Venice AI Soulful Agent"
        : isArabic
        ? "بالتقييم الشامل المحلي"
        : "with local multi-signal scoring";
      toast.success(isArabic ? `تم تشغيل التقييم ${providerNote} وتحديث ملف الدعم.` : `Evaluation completed ${providerNote}.`);
      void utils.records.supportEvaluations.invalidate();
      void utils.records.learningAssessments.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const review = trpc.records.reviewSupportEvaluation.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم تحديث حالة المراجعة." : "Review status updated.");
      void utils.records.supportEvaluations.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const recordAssessmentMutation = trpc.records.recordLearningAssessment.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم تسجيل العلامة/القيمة في السجل الأكاديمي" : "Value/Score recorded successfully");
      setCustomLabelName("");
      setCustomLabelNote("");
      void utils.records.learningAssessments.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createCrmRecordMutation = trpc.records.createEducatorRecord.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تمت إضافة الملاحظة في نظام المعلم (CRM)" : "Record added to Educator CRM");
      void utils.records.educatorRecords.invalidate();
      setIsCustomRecordOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredLearners = useMemo(
    () =>
      (learners.data ?? [])
        .filter((item) => stageFilter === "all" || item.grade === stageFilter)
        .sort((a, b) =>
          sortBy === "stage"
            ? educationStageLabel(a.grade, isArabic).localeCompare(educationStageLabel(b.grade, isArabic), isArabic ? "ar" : "en")
            : (isArabic ? a.nameAr : a.name).localeCompare(isArabic ? b.nameAr : b.name, isArabic ? "ar" : "en")
        ),
    [learners.data, stageFilter, sortBy, isArabic]
  );

  const selected = learners.data?.find((item) => item.id === learnerId);
  const latest = evaluations.data?.[0];
  const evidence = latest ? parseJson<Evidence>(latest.evidenceJson, {}) : null;
  const factors = latest ? parseJson<string[]>(latest.factorsJson, []) : [];
  const recommendations = latest ? parseJson<string[]>(latest.recommendationsJson, []) : [];

  const learnerCrmLogs = useMemo(
    () => (crmRecords.data || []).filter((r) => r.learnerId === learnerId),
    [crmRecords.data, learnerId]
  );

  const chartData = useMemo(
    () =>
      (assessments.data || [])
        .slice()
        .reverse()
        .map((item) => ({
          date: new Date(item.assessedAt).toLocaleDateString(isArabic ? "ar-DZ" : "en-GB", { month: "short", day: "numeric" }),
          subject: item.subject,
          score: item.score,
        })),
    [assessments.data, isArabic]
  );

  const subjectData = evidence?.subjectTrends ?? [];

  const runEvaluation = () => {
    if (learnerId) generate.mutate({ learnerId, language: isArabic ? "ar" : "en" });
  };

  const level =
    latest?.supportLevel === "progressing"
      ? { ar: "يتقدم بنجاح", en: "Progressing", className: "bg-emerald-50 text-emerald-800 border-emerald-200" }
      : latest?.supportLevel === "needs_support"
      ? { ar: "يحتاج دعماً موجهاً", en: "Needs support", className: "bg-amber-50 text-amber-800 border-amber-200" }
      : { ar: "مراجعة عاجلة وتركيز", en: "Urgent review", className: "bg-rose-50 text-rose-800 border-rose-200" };

  const confidenceLabel =
    evidence?.confidence === "high"
      ? isArabic
        ? "ثقة عالية (بيانات متكاملة)"
        : "High confidence"
      : evidence?.confidence === "medium"
      ? isArabic
        ? "ثقة متوسطة"
        : "Medium confidence"
      : evidence?.confidence === "low"
      ? isArabic
        ? "ثقة أولية — بحاجة لإشارات إضافية"
        : "Initial confidence"
      : undefined;

  const strong = evidence?.strongSubjects ?? [];
  const weak = evidence?.weakSubjects ?? [];

  const handleAddQuickValue = () => {
    if (!learnerId || !customLabelName.trim()) {
      toast.error(isArabic ? "يرجى كتابة اسم المعيار أو المهارة أولاً" : "Please enter a label name");
      return;
    }
    recordAssessmentMutation.mutate({
      learnerId,
      subject: customLabelName.trim(),
      score: customLabelScore,
      assessmentType: customLabelCategory,
      assessedAt: new Date(),
      note: customLabelNote.trim() || undefined,
    });
  };

  const exportCsv = () => {
    if (!latest || !evidence) return toast.error(isArabic ? "لا توجد نتيجة للتصدير." : "No evaluation to export.");
    const rows = [
      ["learner", selected ? (isArabic ? selected.nameAr : selected.name) : learnerId],
      ["stage", latest.stage],
      ["supportLevel", latest.supportLevel],
      ["confidence", evidence.confidence ?? ""],
      ["dataCompleteness", `${evidence.dataCompleteness ?? ""}%`],
      ["averageScore", String(evidence.averageScore ?? "")],
      ["attendanceRate", String(evidence.attendanceRate ?? "")],
      ["strongSubjects", strong.join("; ")],
      ["weakSubjects", weak.join("; ")],
      ["factors", factors.join(" | ")],
      ["recommendations", recommendations.join(" | ")],
      ["summary", latest.aiSummary ?? ""],
      ["archetype", evidence.soulfulAnalysis?.holisticArchetype ?? ""],
      ["followUpAt", latest.followUpAt ? new Date(latest.followUpAt).toISOString() : ""],
      ["status", latest.status],
    ];
    const csv = rows.map(([k, v]) => `"${String(k).replaceAll('"', '""')}","${String(v ?? "").replaceAll('"', '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edupulse-evaluation-${learnerId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isArabic ? "تم تصدير التحليل." : "Analysis exported.");
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Banner / Dashboard Header */}
      <section className="rounded-[28px] bg-gradient-to-br from-white via-[#f7fdff] to-[#fff8d9] p-6 text-[#0a3b52] shadow-[0_20px_60px_rgba(8,65,96,.12)] md:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
              <BrainCircuit className="h-4 w-4" />
              {isArabic ? "لوحة تقييم الدعم · نظام المعلم والوكيل التشخيصي الإنساني" : "Support Evaluation · Teacher CRM & Soulful AI"}
            </div>
            <h2 className="text-display text-3xl font-bold tracking-tight md:text-4xl">
              {isArabic ? "تشخيص تكاملي ذو روح وهدف للمتعلمين والباحثين" : "Holistic & Soulful Diagnostic of Learner Progress"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#376276]">
              {isArabic
                ? "تشخيص متعدد الأبعاد متصل مباشرة بنظام المعلم (CRM): درجات المواد، الإشارات السلوكية، مؤشر الأمان النفسي، ونقاط القوة الكامنة لتلاميذ المدارس والباحثين الجامعيين."
                : "Multidimensional diagnostics directly integrated with the Educator CRM: grades, behavioral indicators, psychological safety index, and latent strengths for both school students and university researchers."}
            </p>
            {evidence?.dataCompleteness !== undefined && (
              <div className="mt-4 flex items-center gap-3 text-xs">
                <span className="text-[#547083]">{isArabic ? "اكتمال البيانات" : "Data completeness"}</span>
                <div className="h-2 w-32 overflow-hidden rounded-full bg-white">
                  <div className="h-full bg-cyan-600 transition" style={{ width: `${evidence.dataCompleteness}%` }} />
                </div>
                <span className="font-semibold">{evidence.dataCompleteness}%</span>
                {confidenceLabel && (
                  <span
                    className={`rounded-full border px-2 py-0.5 ${
                      evidence.confidence === "low"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : evidence.confidence === "high"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-cyan-50 border-cyan-200 text-cyan-800"
                    }`}
                  >
                    {confidenceLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/85 p-4 border border-cyan-100">
              <Gauge className="h-5 w-5 text-cyan-600" />
              <strong className="mt-3 block text-2xl">{evidence?.averageScore ?? "—"}</strong>
              <span className="text-xs text-[#547083]">{isArabic ? "المعدل العام" : "Average"}</span>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 border border-cyan-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <strong className="mt-3 block text-2xl">{evidence?.attendanceRate ?? "—"}%</strong>
              <span className="text-xs text-[#547083]">{isArabic ? "نسبة الحضور" : "Attendance"}</span>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 border border-cyan-100">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <strong className="mt-3 block text-2xl">{evaluations.data?.length ?? 0}</strong>
              <span className="text-xs text-[#547083]">{isArabic ? "جلسات التقييم" : "Reviews"}</span>
            </div>
          </div>
        </div>

        {/* Action and Filter Controls */}
        <div className="mt-7 grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_auto] md:items-end">
          <label className="block text-xs font-semibold text-[#376276]">
            {isArabic ? "المرحلة التعليمية" : "Stage"}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as typeof stageFilter)}
              className="mt-2 w-full rounded-xl border border-cyan-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">{isArabic ? "كل المراحل (المدارس والجامعات)" : "All stages"}</option>
              {ALGERIA_EDUCATION_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {isArabic ? stage.ar : stage.en}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-[#376276]">
            {isArabic ? "ترتيب القائمة" : "Sort learners"}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="mt-2 w-full rounded-xl border border-cyan-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="name">{isArabic ? "حسب الاسم" : "By name"}</option>
              <option value="stage">{isArabic ? "حسب المرحلة" : "By stage"}</option>
            </select>
          </label>

          <label className="block text-xs font-semibold text-[#376276]">
            {isArabic ? "المتعلم / الباحث الجامعي" : "Learner / Researcher"}
            <select
              value={learnerId}
              onChange={(e) => setLearnerId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-cyan-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">{isArabic ? "— اختر متعلماً أو باحثاً —" : "— Choose learner —"}</option>
              {filteredLearners.map((item) => (
                <option key={item.id} value={item.id}>
                  {isArabic ? item.nameAr : item.name} · {educationStageLabel(item.grade, isArabic)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsAddStudentModalOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50/80 px-3.5 py-2.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
              title={isArabic ? "إضافة طالب مدرسي أو باحث جامعي جديد" : "Add student or university researcher"}
            >
              <UserPlus className="h-4 w-4" />
              {isArabic ? "إضافة طالب / جامعة" : "Add Entity"}
            </button>

            <button
              type="button"
              disabled={!learnerId || generate.isPending}
              onClick={runEvaluation}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0a6f88] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-900/15 transition hover:bg-[#075a70] disabled:opacity-40"
            >
              {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isArabic ? "تشغيل التقييم التشخيصي" : "Run Soulful Evaluation"}
            </button>

            {latest && (
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#0a3b52] hover:bg-slate-50 transition"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#547083]">
          <ShieldAlert className="h-4 w-4 text-cyan-700" />
          {isArabic
            ? "نظام المعلم · الأداة موجهة للمرافقة التربوية والأكاديمية، والقرار البشري للمعلم هو المرجع الأسمى دائماً."
            : "Pedagogical and academic aid · human educator judgment remains the ultimate authority."}
        </div>
      </section>

      {!selected && (
        <div className="rounded-2xl border border-dashed border-cyan-200 bg-white/80 p-12 text-center text-sm text-[#547083]">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 text-cyan-600 opacity-60" />
          <p className="font-semibold text-slate-700">
            {isArabic ? "اختر متعلماً أو باحثاً جامعياً من القائمة أعلاه أو أضف كياناً جديداً للبدء" : "Choose a learner or add a new entity to begin evaluation."}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic ? "يمكنك أيضاً تسجيل علامات وقيم سلوكية مخصصة مرتبطة بنظام المعلم CRM" : "You can also record custom labels and values linked to Educator CRM."}
          </p>
        </div>
      )}

      {selected && (
        <>
          {/* ========================================================= */}
          {/* SOULFUL DIAGNOSTIC AGENT FEEDBACK & ARCHETYPE BANNER */}
          {/* ========================================================= */}
          {evidence?.soulfulAnalysis && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-cyan-50/90 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-md">
                        {isArabic ? "النمط التربوي الشامل (Archetype)" : "Soulful Archetype"}
                      </span>
                      {evidence.soulfulAnalysis.psychologicalSafetyIndex !== undefined && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Heart className="w-3 h-3 text-emerald-600" />
                          {isArabic ? "مؤشر الأمان النفسي: " : "Safety Index: "}
                          {evidence.soulfulAnalysis.psychologicalSafetyIndex}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {evidence.soulfulAnalysis.holisticArchetype || (isArabic ? "المتعلم الواعد المستكشف" : "Promising Explorer")}
                    </h3>
                  </div>
                </div>

                {evidence.soulfulAnalysis.recommendedPedagogicalApproach && (
                  <div className="bg-white/90 border border-blue-100 rounded-xl px-4 py-2.5 max-w-md">
                    <span className="text-[11px] font-bold text-blue-800 block">
                      {isArabic ? "النهج التربوي المقترح من الوكيل الإنساني:" : "Recommended Pedagogical Approach:"}
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                      {evidence.soulfulAnalysis.recommendedPedagogicalApproach}
                    </p>
                  </div>
                )}
              </div>

              {evidence.soulfulAnalysis.compassionateNarrative && (
                <div className="mt-4 pt-4 border-t border-blue-100/80">
                  <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    {isArabic ? "السرد التربوي الإنساني (Compassionate Narrative):" : "Compassionate Pedagogical Narrative:"}
                  </p>
                  <p className="text-xs text-slate-700 leading-6 bg-white/70 p-3 rounded-xl border border-blue-50">
                    {evidence.soulfulAnalysis.compassionateNarrative}
                  </p>
                </div>
              )}

              {/* Hidden Potentials & Growth Edges */}
              {(evidence.soulfulAnalysis.hiddenPotentials?.length || evidence.soulfulAnalysis.growthEdges?.length) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {evidence.soulfulAnalysis.hiddenPotentials && evidence.soulfulAnalysis.hiddenPotentials.length > 0 && (
                    <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        {isArabic ? "القدرات الكامنة والفرص الإبداعية:" : "Hidden Potentials:"}
                      </span>
                      <ul className="space-y-1">
                        {evidence.soulfulAnalysis.hiddenPotentials.map((p, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evidence.soulfulAnalysis.growthEdges && evidence.soulfulAnalysis.growthEdges.length > 0 && (
                    <div className="bg-white/80 p-3.5 rounded-xl border border-amber-100">
                      <span className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-2">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        {isArabic ? "محاور النمو والمرافقة الشخصية:" : "Growth Edges:"}
                      </span>
                      <ul className="space-y-1">
                        {evidence.soulfulAnalysis.growthEdges.map((g, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION: LEARNING CHART & REVIEW RESULT */}
          {/* ========================================================= */}
          <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
            <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_18px_45px_rgba(8,65,96,.1)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-display text-2xl font-bold">{isArabic ? "منحنى التعلم والقيم الأكاديمية" : "Learning & Value Curve"}</p>
                  <p className="mt-1 text-sm text-[#547083]">
                    {isArabic ? selected.nameAr : selected.name} · {educationStageLabel(selected.grade, isArabic)}
                  </p>
                </div>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">
                  {assessments.data?.length || 0} {isArabic ? "علامات وقيم مسجلة" : "records"}
                </span>
              </div>
              <div className="mt-5 h-72">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="supportScore2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#18a7c9" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#18a7c9" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbeef2" />
                      <XAxis dataKey="date" stroke="#6f8b98" />
                      <YAxis domain={[0, 100]} stroke="#6f8b98" />
                      <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #cceaf0", borderRadius: 14, color: "#0a3b52" }} />
                      <Area type="monotone" dataKey="score" stroke="#0a91b2" strokeWidth={3} fill="url(#supportScore2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-full place-items-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/40 text-sm text-[#547083]">
                    {isArabic
                      ? "أضف قيماً وعلامات للمتعلم من شريط القيم أدناه لعرض المنحنى الزمني الدقيق."
                      : "Add values and assessment scores below to render the learning curve."}
                  </div>
                )}
              </div>
              {evidence && (
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-xl bg-cyan-50 px-3 py-2">
                    <span className="block text-[11px] text-[#547083]">{isArabic ? "مستوى CEFR" : "CEFR avg"}</span>
                    <strong>{evidence.cefrAverage ?? "—"}</strong>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="block text-[11px] text-[#547083]">{isArabic ? "غيابات" : "Absences"}</span>
                    <strong>{evidence.absences ?? 0}</strong>
                  </div>
                  <div className="rounded-xl bg-amber-50 px-3 py-2">
                    <span className="block text-[11px] text-[#547083]">{isArabic ? "تأخرات" : "Late"}</span>
                    <strong>{evidence.late ?? 0}</strong>
                  </div>
                </div>
              )}
            </article>

            <article className="rounded-[24px] bg-gradient-to-br from-[#e9fbff] to-[#fff8d9] p-6 text-[#0a3b52]">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-800">{isArabic ? "نتيجة المراجعة" : "Review result"}</p>
              {latest ? (
                <>
                  <div className={`mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${level.className}`}>
                    {isArabic ? level.ar : level.en}
                  </div>
                  <p className="mt-3 text-xs text-[#547083]">
                    {confidenceLabel} · {isArabic ? `اكتمال ${evidence?.dataCompleteness ?? 0}%` : `${evidence?.dataCompleteness ?? 0}% complete`}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[#376276]">{latest.aiSummary}</p>
                  {latest.followUpAt && (
                    <p className="mt-3 text-xs text-[#547083]">
                      {isArabic ? "متابعة مقترحة: " : "Suggested follow-up: "}
                      {new Date(latest.followUpAt).toLocaleDateString(isArabic ? "ar-DZ" : "en-GB")}
                    </p>
                  )}
                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      onClick={() => review.mutate({ evaluationId: latest.id, status: latest.status === "draft" ? "reviewed" : "shared" })}
                      disabled={review.isPending}
                      className="inline-flex items-center gap-2 rounded-full bg-[#0a6f88] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {latest.status === "draft"
                        ? isArabic
                          ? "اعتماد للمراجعة"
                          : "Mark reviewed"
                        : isArabic
                        ? "مشاركة مع الموظفين"
                        : "Share with staff"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-2xl bg-white/70 p-5 text-sm leading-7 text-[#547083]">
                  {isArabic
                    ? "لم يتم إنشاء تقييم بعد. اضغط تشغيل التقييم التشخيصي لمعالجة السجلات وإشارات نظام المعلم."
                    : "No review yet. Press Run Soulful Evaluation to synthesize signals."}
                </div>
              )}
            </article>
          </section>

          {/* ========================================================= */}
          {/* SECTION: ACTIVE LABELS & VALUES WORKSPACE (تفعيل القيم والعلامات) */}
          {/* ========================================================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-600" />
                  {isArabic ? "تفعيل القيم والعلامات السلوكية والأكاديمية" : "Active Labels & Values Workspace"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isArabic
                    ? "أدخل معايير تشخيصية مخصصة (الانضباط، التفكير النقدي، مهارات العرض، روح المبادرة) وقيمها (0-100) ليتم دمجها في التحليل."
                    : "Add custom diagnostic criteria and scores (0-100) to feed the multi-signal evaluation."}
                </p>
              </div>

              {/* Preset Quick Label Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { ar: "الانضباط والمواظبة", en: "Discipline", cat: "behavior" as const },
                  { ar: "التفكير النقدي", en: "Critical Thinking", cat: "intellectual_skill" as const },
                  { ar: "التفاعل الأكاديمي", en: "Engagement", cat: "mentorship" as const },
                  { ar: "الإشراف والبحث", en: "Research Supervision", cat: "supervision" as const },
                ].map((chip) => (
                  <button
                    key={chip.en}
                    type="button"
                    onClick={() => {
                      setCustomLabelName(isArabic ? chip.ar : chip.en);
                      setCustomLabelCategory(chip.cat);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 font-medium transition"
                  >
                    + {isArabic ? chip.ar : chip.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isArabic ? "اسم المعيار / القيمة" : "Label / Criterion Name"}
                </label>
                <input
                  type="text"
                  value={customLabelName}
                  onChange={(e) => setCustomLabelName(e.target.value)}
                  placeholder={isArabic ? "مثال: مهارات التحليل والاستدلال" : "e.g., Analytical Rigor"}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isArabic ? "التصنيف الإشرافي" : "Supervisory Category"}
                </label>
                <select
                  value={customLabelCategory}
                  onChange={(e) => setCustomLabelCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="intellectual_skill">{isArabic ? "مهارة فكرية / بحثية" : "Intellectual Skill"}</option>
                  <option value="behavior">{isArabic ? "سلوك ومواظبة" : "Behavior & Discipline"}</option>
                  <option value="mentorship">{isArabic ? "إرشاد ومرافقة" : "Mentorship"}</option>
                  <option value="supervision">{isArabic ? "إشراف أطروحة / مشروع" : "Supervision"}</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">{isArabic ? "القيمة المحققة (0-100)" : "Score (0-100)"}</label>
                  <span className="text-xs font-bold text-cyan-700">{customLabelScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customLabelScore}
                  onChange={(e) => setCustomLabelScore(Number(e.target.value))}
                  className="w-full accent-cyan-600"
                />
              </div>

              <div>
                <button
                  type="button"
                  disabled={!customLabelName.trim() || recordAssessmentMutation.isPending}
                  onClick={handleAddQuickValue}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition disabled:opacity-40 shadow-xs"
                >
                  {recordAssessmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isArabic ? "حفظ القيمة وتشغيل المزامنة" : "Save Value & Sync"}
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION: INTEGRATION WITH EDUCATOR CRM (نظام المعلم) */}
          {/* ========================================================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                  {isArabic ? "سجلات نظام المعلم (Educator CRM) المرتبطة بهذا الطالب" : "Linked Educator CRM Records"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isArabic
                    ? "السجلات السلوكية، جلسات الإرشاد، ومذكرات الإشراف المسجلة التي تغذي محرك التشخيص."
                    : "Behavioral notes, mentorship sessions, and supervision logs that inform the evaluation."}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                {learnerCrmLogs.length} {isArabic ? "سجلات مسجلة" : "records"}
              </span>
            </div>

            {learnerCrmLogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {learnerCrmLogs.map((record) => (
                  <div key={record.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white transition">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {record.category.replace("_", " ")}
                      </span>
                      {record.score !== null && (
                        <span className="text-xs font-bold text-emerald-700">{record.score} / 100</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{record.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{record.summary}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(record.createdAt).toLocaleDateString(isArabic ? "ar-DZ" : "en-US")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 text-center text-xs text-slate-500 border border-dashed border-slate-200">
                {isArabic
                  ? "لا توجد سجلات سلوكية أو إرشادية مدخلة لهذا المتعلم في نظام المعلم حتى الآن. يمكنك تفعيل قيم من شريط القيم أعلاه."
                  : "No behavioral or mentorship CRM records found for this learner yet."}
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* SECTION: STRENGTHS & SUPPORT CATEGORIES */}
          {/* ========================================================= */}
          {latest && (
            <>
              <section className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <p className="text-display text-2xl font-bold">{isArabic ? "نقاط القوة المحققة" : "Strengths"}</p>
                  </div>
                  <p className="mt-2 text-xs text-[#547083]">
                    {isArabic ? "موثّقة من الأدلة الواقعية، وليست أحكاماً عامة." : "Evidence-based, not generic praise."}
                  </p>
                  {strong.length ? (
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-[#376276]">
                      {strong.map((s) => (
                        <li key={s} className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#547083]">
                      {isArabic ? "لا توجد مواد فوق 75% بعد — استمر في جمع الأدلة وتفعيل القيم." : "No subject above 75% yet."}
                    </p>
                  )}
                </article>

                <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                    <p className="text-display text-2xl font-bold">{isArabic ? "صعوبات تتطلب دعماً ومرافقة" : "Needs Support"}</p>
                  </div>
                  <p className="mt-2 text-xs text-[#547083]">
                    {isArabic ? "بدون وصم أو أحكام مسبقة." : "Constructive and without stigma."}
                  </p>
                  {weak.length ? (
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-[#376276]">
                      {weak.map((s) => (
                        <li key={s} className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3">
                          <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#547083]">
                      {isArabic ? "لا توجد مواد دون 50% — حافظ على نسق المتابعة الإيجابي." : "No subject below 50%."}
                    </p>
                  )}
                </article>
              </section>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {subjectData.map((item) => (
                  <article key={item.subject} className="rounded-2xl bg-white p-5 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">{item.subject}</p>
                      {(item.latest ?? item.average) >= item.average ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                    <strong className="mt-4 block text-3xl">{item.average}</strong>
                    <p className="mt-1 text-xs text-[#547083]">
                      {isArabic ? "متوسط القيمة" : "Average"} · {item.assessments} {isArabic ? "سجلات" : "assessments"}
                    </p>
                  </article>
                ))}
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]">
                  <p className="text-display text-2xl font-bold">{isArabic ? "عوامل محتملة تحتاج تحققاً" : "Possible factors to verify"}</p>
                  <p className="mt-1 text-xs text-[#547083]">{isArabic ? "فرضيات قابلة للاختبار، وليست تشخيصاً قطيعاً." : "Testable hypotheses."}</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[#547083]">
                    {factors.map((item) => (
                      <li key={item} className="rounded-xl bg-amber-50 px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]">
                  <p className="text-display text-2xl font-bold">{isArabic ? "خطة المتابعة المقترحة" : "Suggested follow-up"}</p>
                  <p className="mt-1 text-xs text-[#547083]">{isArabic ? "خطوات عملية قصيرة المدى للمعلم والمرشد." : "Short, practical next steps."}</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[#547083]">
                    {recommendations.map((item) => (
                      <li key={item} className="rounded-xl bg-cyan-50 px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </section>
            </>
          )}
        </>
      )}

      {/* Modal for adding a student or university researcher */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        isArabic={isArabic}
        onStudentCreated={(student) => {
          setIsAddStudentModalOpen(false);
          setLearnerId(student.id);
          void utils.records.learners.invalidate();
          toast.success(isArabic ? `تم تحديد ${student.nameAr || student.name} مباشرة للتقييم` : `Selected ${student.name} for evaluation`);
        }}
      />
    </div>
  );
}
