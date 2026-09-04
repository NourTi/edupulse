import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BrainCircuit, CheckCircle2, Download, Gauge, Loader2, ShieldAlert, Sparkles, TrendingDown, TrendingUp, AlertTriangle, Award, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ALGERIA_EDUCATION_STAGES, educationStageLabel } from "@shared/educationStages";

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
};

function parseJson<T>(value: string | null | undefined, fallback: T): T { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }

export function StudentSupportEvaluationPanel({ isArabic }: Props) {
  const [learnerId, setLearnerId] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | "preparatory" | "primary" | "middle" | "secondary" | "higher">("all");
  const [sortBy, setSortBy] = useState<"name" | "stage">("name");
  const learners = trpc.records.learners.useQuery(undefined, { retry: false });
  const assessments = trpc.records.learningAssessments.useQuery({ learnerId }, { enabled: Boolean(learnerId), retry: false });
  const evaluations = trpc.records.supportEvaluations.useQuery({ learnerId }, { enabled: Boolean(learnerId), retry: false });
  const utils = trpc.useUtils();
  const generate = trpc.records.generateSupportEvaluation.useMutation({ onSuccess: (result) => {
    const providerNote = (result as unknown as { usedVenice?: boolean }).usedVenice
      ? (isArabic ? "باستخدام Venice AI" : "with Venice AI")
      : (isArabic ? "بالتقييم المحلي" : "with local scoring");
    toast.success(isArabic ? `تم تشغيل التقييم ${providerNote} وإنشاء نتيجة للمراجعة.` : `Evaluation completed ${providerNote} for review.`);
    void utils.records.supportEvaluations.invalidate();
    void utils.records.learningAssessments.invalidate();
  }, onError: error => toast.error(error.message) });
  const review = trpc.records.reviewSupportEvaluation.useMutation({ onSuccess: () => { toast.success(isArabic ? "تم تحديث حالة المراجعة." : "Review status updated."); void utils.records.supportEvaluations.invalidate(); }, onError: error => toast.error(error.message) });

  const filteredLearners = useMemo(() => (learners.data ?? []).filter(item => stageFilter === "all" || item.grade === stageFilter).sort((a, b) => sortBy === "stage" ? educationStageLabel(a.grade, isArabic).localeCompare(educationStageLabel(b.grade, isArabic), isArabic ? "ar" : "en") : (isArabic ? a.nameAr : a.name).localeCompare(isArabic ? b.nameAr : b.name, isArabic ? "ar" : "en")), [learners.data, stageFilter, sortBy, isArabic]);
  const selected = learners.data?.find(item => item.id === learnerId);
  const latest = evaluations.data?.[0];
  const evidence = latest ? parseJson<Evidence>(latest.evidenceJson, {}) : null;
  const factors = latest ? parseJson<string[]>(latest.factorsJson, []) : [];
  const recommendations = latest ? parseJson<string[]>(latest.recommendationsJson, []) : [];
  const chartData = useMemo(() => (assessments.data || []).slice().reverse().map(item => ({ date: new Date(item.assessedAt).toLocaleDateString(isArabic ? "ar-DZ" : "en-GB", { month: "short", day: "numeric" }), subject: item.subject, score: item.score })), [assessments.data, isArabic]);
  const subjectData = evidence?.subjectTrends ?? [];
  const runEvaluation = () => { if (learnerId) generate.mutate({ learnerId, language: isArabic ? "ar" : "en" }); };
  const level = latest?.supportLevel === "progressing" ? { ar: "يتقدم", en: "Progressing", className: "bg-emerald-50 text-emerald-800 border-emerald-200" } : latest?.supportLevel === "needs_support" ? { ar: "يحتاج دعماً", en: "Needs support", className: "bg-amber-50 text-amber-800 border-amber-200" } : { ar: "مراجعة عاجلة", en: "Urgent review", className: "bg-rose-50 text-rose-800 border-rose-200" };
  const confidenceLabel = evidence?.confidence === "high" ? (isArabic ? "ثقة عالية" : "High confidence") : evidence?.confidence === "medium" ? (isArabic ? "ثقة متوسطة" : "Medium confidence") : evidence?.confidence === "low" ? (isArabic ? "ثقة منخفضة — بيانات محدودة" : "Low confidence — limited data") : undefined;
  const strong = evidence?.strongSubjects ?? [];
  const weak = evidence?.weakSubjects ?? [];

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
      ["followUpAt", latest.followUpAt ? new Date(latest.followUpAt).toISOString() : ""],
      ["status", latest.status],
    ];
    const csv = rows.map(([k,v]) => `"${String(k).replaceAll('"','""')}","${String(v ?? '').replaceAll('"','""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `edupulse-evaluation-${learnerId}-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success(isArabic ? "تم تصدير التحليل." : "Analysis exported.");
  };

  return <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
    <section className="rounded-[28px] bg-gradient-to-br from-white via-[#f7fdff] to-[#fff8d9] p-6 text-[#0a3b52] shadow-[0_20px_60px_rgba(8,65,96,.12)] md:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800"><BrainCircuit className="h-4 w-4" />{isArabic ? "لوحة المعلم · Venice AI + تقييم محلي" : "Teacher dashboard · Venice AI + local aid"}</div>
          <h2 className="text-display text-4xl tracking-tight md:text-5xl">{isArabic ? "صورة واضحة لتقدم المتعلم" : "A clear view of learner progress"}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#376276]">{isArabic ? "مراجعة تعليمية غير سريرية تعمل بالبيانات: درجات، حضور، CEFR، سلوك، إشراف. Venice يلخص الأدلة عندما يتوفر؛ وإلا يعمل التقييم المحلي المحدد تلقائياً. كل نتيجة تتطلب مراجعة المعلم قبل المشاركة." : "A non-clinical, data-driven aid using grades, attendance, CEFR, behavior, supervision. Venice synthesizes evidence when configured; deterministic local scoring guarantees a result otherwise. Every result requires teacher review before sharing."}</p>
          {evidence?.dataCompleteness !== undefined && <div className="mt-4 flex items-center gap-3 text-xs"><span className="text-[#547083]">{isArabic ? "اكتمال البيانات" : "Data completeness"}</span><div className="h-2 w-32 overflow-hidden rounded-full bg-white"><div className="h-full bg-cyan-600 transition" style={{ width: `${evidence.dataCompleteness}%` }} /></div><span className="font-semibold">{evidence.dataCompleteness}%</span>{confidenceLabel && <span className={`rounded-full border px-2 py-0.5 ${evidence.confidence === "low" ? "bg-amber-50 border-amber-200 text-amber-800" : evidence.confidence === "high" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-cyan-50 border-cyan-200 text-cyan-800"}`}>{confidenceLabel}</span>}</div>}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/85 p-4"><Gauge className="h-5 w-5 text-cyan-600" /><strong className="mt-3 block text-2xl">{evidence?.averageScore ?? "—"}</strong><span className="text-xs text-[#547083]">{isArabic ? "متوسط" : "Average"}</span></div>
          <div className="rounded-2xl bg-white/85 p-4"><TrendingUp className="h-5 w-5 text-emerald-600" /><strong className="mt-3 block text-2xl">{evidence?.attendanceRate ?? "—"}%</strong><span className="text-xs text-[#547083]">{isArabic ? "حضور" : "Attendance"}</span></div>
          <div className="rounded-2xl bg-white/85 p-4"><Sparkles className="h-5 w-5 text-amber-500" /><strong className="mt-3 block text-2xl">{evaluations.data?.length ?? 0}</strong><span className="text-xs text-[#547083]">{isArabic ? "مراجعات" : "Reviews"}</span></div>
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
        <label className="block text-xs font-semibold text-[#376276]">{isArabic ? "المرحلة الجزائرية" : "Algerian stage"}<select value={stageFilter} onChange={event => setStageFilter(event.target.value as typeof stageFilter)} className="control-light mt-2 w-full px-4 py-3 text-sm"><option value="all">{isArabic ? "كل المراحل" : "All stages"}</option>{ALGERIA_EDUCATION_STAGES.map(stage => <option key={stage.id} value={stage.id}>{isArabic ? stage.ar : stage.en}</option>)}</select></label>
        <label className="block text-xs font-semibold text-[#376276]">{isArabic ? "ترتيب القائمة" : "Sort learners"}<select value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)} className="control-light mt-2 w-full px-4 py-3 text-sm"><option value="name">{isArabic ? "حسب الاسم" : "By name"}</option><option value="stage">{isArabic ? "حسب المرحلة" : "By stage"}</option></select></label>
        <label className="block text-xs font-semibold text-[#376276]">{isArabic ? "المتعلم" : "Learner"}<select value={learnerId} onChange={event => setLearnerId(event.target.value)} className="control-light mt-2 w-full px-4 py-3 text-sm"><option value="">{isArabic ? "اختر المتعلم" : "Choose learner"}</option>{filteredLearners.map(item => <option key={item.id} value={item.id}>{isArabic ? item.nameAr : item.name} · {educationStageLabel(item.grade, isArabic)}</option>)}</select></label>
        <div className="flex gap-2">
          <button type="button" disabled={!learnerId || generate.isPending} onClick={runEvaluation} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0a6f88] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:bg-[#075a70] disabled:opacity-40">{generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{isArabic ? "تشغيل تقييم Venice" : "Run Venice evaluation"}</button>
          {latest && <button type="button" onClick={exportCsv} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-cyan-200 bg-white px-5 py-3 text-sm font-semibold text-[#0a3b52]"><Download className="h-4 w-4" />CSV</button>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#547083]"><ShieldAlert className="h-4 w-4 text-cyan-700" />{isArabic ? "للموظفين المصرح لهم فقط · لا يوجد تشخيص نفسي أو طبي · التحليل يبقى مساعدة، وقرار المعلم هو المرجع." : "Authorized staff only · no psychological or medical diagnosis · analysis is an aid, teacher judgement is the source of truth."}</div>
      {evidence?.missingSignals && evidence.missingSignals.length > 0 && <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-6 text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{isArabic ? "تنبيه اكتمال البيانات: " : "Data completeness note: "}{evidence.missingSignals.join(isArabic ? "، " : ", ")} · {isArabic ? "أضف تقييمات أو حضورًا لتحسين الدقة." : "Add assessments or attendance to improve confidence."}</span></div>}
    </section>

    {!selected && <div className="rounded-2xl border border-dashed border-cyan-200 bg-white/80 p-10 text-center text-sm text-[#547083]">{isArabic ? "اختر متعلماً لعرض المنحنى والنتيجة. نصيحة المسهل: ابدأ بالمرحلة ثم الاسم، وشغّل التقييم من الأدلة." : "Choose a learner to view the chart and evaluation. Facilitator tip: filter by stage, then name, then Run evaluation from evidence."}</div>}

    {selected && <>
      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_18px_45px_rgba(8,65,96,.1)]">
          <div className="flex items-start justify-between gap-4"><div><p className="text-display text-3xl">{isArabic ? "منحنى التعلم" : "Learning chart"}</p><p className="mt-1 text-sm text-[#547083]">{isArabic ? selected.nameAr : selected.name} · {educationStageLabel(selected.grade, isArabic)}</p></div><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs text-cyan-800">{assessments.data?.length || 0} {isArabic ? "تقييمات" : "assessments"}</span></div>
          <div className="mt-5 h-72">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="supportScore2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#18a7c9" stopOpacity={0.5} /><stop offset="95%" stopColor="#18a7c9" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#dbeef2" /><XAxis dataKey="date" stroke="#6f8b98" /><YAxis domain={[0, 100]} stroke="#6f8b98" /><Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #cceaf0", borderRadius: 14, color: "#0a3b52" }} /><Area type="monotone" dataKey="score" stroke="#0a91b2" strokeWidth={3} fill="url(#supportScore2)" /></AreaChart></ResponsiveContainer> : <div className="grid h-full place-items-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/40 text-sm text-[#547083]">{isArabic ? "أضف تقييمات للمتعلم لعرض المنحنى. كل نقطة هي دليل زمني يُظهر الاتجاه، وليس حكماً." : "Add assessments to display the learning chart. Each point is time-based evidence showing trend, not a verdict."}</div>}</div>
          {evidence && <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs"><div className="rounded-xl bg-cyan-50 px-3 py-2"><span className="block text-[11px] text-[#547083]">{isArabic ? "CEFR" : "CEFR avg"}</span><strong>{evidence.cefrAverage ?? "—"}</strong></div><div className="rounded-xl bg-emerald-50 px-3 py-2"><span className="block text-[11px] text-[#547083]">{isArabic ? "غياب" : "Absences"}</span><strong>{evidence.absences ?? 0}</strong></div><div className="rounded-xl bg-amber-50 px-3 py-2"><span className="block text-[11px] text-[#547083]">{isArabic ? "تأخر" : "Late"}</span><strong>{evidence.late ?? 0}</strong></div></div>}
        </article>
        <article className="rounded-[24px] bg-gradient-to-br from-[#e9fbff] to-[#fff8d9] p-6 text-[#0a3b52]">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-800">{isArabic ? "نتيجة المراجعة" : "Review result"}</p>
          {latest ? <><div className={`mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${level.className}`}>{isArabic ? level.ar : level.en}</div>
            <p className="mt-3 text-xs text-[#547083]">{confidenceLabel} · {isArabic ? `اكتمال ${evidence?.dataCompleteness ?? 0}%` : `${evidence?.dataCompleteness ?? 0}% complete`} {latest.aiSummary && (latest.aiSummary.includes("Venice") || (latest.evidenceJson && JSON.parse(latest.evidenceJson).confidence)) ? "" : ""}</p>
            <p className="mt-4 text-sm leading-7 text-[#376276]">{latest.aiSummary}</p>
            {latest.followUpAt && <p className="mt-3 text-xs text-[#547083]">{isArabic ? "متابعة مقترحة: " : "Suggested follow-up: "}{new Date(latest.followUpAt).toLocaleDateString(isArabic ? "ar-DZ" : "en-GB")}</p>}
            <div className="mt-6 flex gap-2"><button type="button" onClick={() => review.mutate({ evaluationId: latest.id, status: latest.status === "draft" ? "reviewed" : "shared" })} disabled={review.isPending} className="inline-flex items-center gap-2 rounded-full bg-[#0a6f88] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"><CheckCircle2 className="h-4 w-4" />{latest.status === "draft" ? (isArabic ? "اعتماد للمراجعة" : "Mark reviewed") : (isArabic ? "مشاركة مع الموظفين" : "Share with staff")}</button></div>
          </> : <div className="mt-5 rounded-2xl bg-white/70 p-5 text-sm leading-7 text-[#547083]">{isArabic ? "لم يتم إنشاء مراجعة بعد. اضغط تشغيل تقييم Venice — يعمل التقييم المحلي تلقائياً إذا لم تكن Venice مفعّلة." : "No review yet. Press Run Venice evaluation — local scoring runs automatically if Venice is not configured."}</div>}
        </article>
      </section>

      {latest && <>
        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]">
            <div className="flex items-center gap-2"><Award className="h-5 w-5 text-emerald-600" /><p className="text-display text-2xl">{isArabic ? "نقاط القوة" : "Strengths"}</p></div>
            <p className="mt-2 text-xs text-[#547083]">{isArabic ? "موثّقة من الأدلة، وليست أحكاماً عامة." : "Evidence-based, not generic praise."}</p>
            {strong.length ? <ul className="mt-4 space-y-2 text-sm leading-6 text-[#376276]">{strong.map(s => <li key={s} className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3"><TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{s}</li>)}</ul> : <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#547083]">{isArabic ? "لا توجد مواد فوق 75% بعد — استمر في جمع الأدلة." : "No subject above 75% yet — keep gathering evidence."}</p>}
          </article>
          <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]">
            <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-amber-600" /><p className="text-display text-2xl">{isArabic ? "صعوبات تتطلب دعما" : "Difficulties needing support"}</p></div>
            <p className="mt-2 text-xs text-[#547083]">{isArabic ? "بدون وصم أو تشخيص." : "Without stigma or diagnosis."}</p>
            {weak.length ? <ul className="mt-4 space-y-2 text-sm leading-6 text-[#376276]">{weak.map(s => <li key={s} className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3"><TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{s}</li>)}</ul> : <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#547083]">{isArabic ? "لا توجد مواد دون 50% — حافظ على المتابعة." : "No subject below 50% — maintain follow-up."}</p>}
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{subjectData.map(item => <article key={item.subject} className="rounded-2xl bg-white p-5 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{item.subject}</p>{(item.latest ?? item.average) >= item.average ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}</div><strong className="mt-4 block text-3xl">{item.average}</strong><p className="mt-1 text-xs text-[#547083]">{isArabic ? "متوسط المادة" : "Subject average"} · {item.assessments} {isArabic ? "تقييمات" : "assessments"}</p></article>)}</section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]"><p className="text-display text-2xl">{isArabic ? "عوامل محتملة تحتاج تحققاً" : "Possible factors to verify"}</p><p className="mt-1 text-xs text-[#547083]">{isArabic ? "فرضيات قابلة للاختبار، ليست تشخيصاً." : "Testable hypotheses, not diagnoses."}</p><ul className="mt-4 space-y-3 text-sm leading-7 text-[#547083]">{factors.map(item => <li key={item} className="rounded-xl bg-amber-50 px-4 py-3">{item}</li>)}</ul></article>
          <article className="rounded-[24px] bg-white p-6 text-[#0a3b52] shadow-[0_12px_32px_rgba(8,65,96,.08)]"><p className="text-display text-2xl">{isArabic ? "خطة المتابعة المقترحة" : "Suggested follow-up"}</p><p className="mt-1 text-xs text-[#547083]">{isArabic ? "خطوات عملية قصيرة المدى." : "Short, practical next steps."}</p><ul className="mt-4 space-y-3 text-sm leading-7 text-[#547083]">{recommendations.map(item => <li key={item} className="rounded-xl bg-cyan-50 px-4 py-3">{item}</li>)}</ul></article>
        </section>
      </>}
    </>}
  </div>;
}
