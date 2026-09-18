import React, { useState } from "react";
import {
  FileCheck2,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { CurriculumMemoryBar } from "./CurriculumMemoryBar";
import { GenerationProgressState } from "./GenerationProgressState";
import { ExportHubBar } from "./ExportHubBar";

interface HomeworkScreenProps {
  isArabic?: boolean;
  defaultSubject?: string;
  defaultGrade?: string;
  topSubjects?: string[];
  topGrades?: string[];
  onCurriculumUpdate?: (subject: string, grade: string) => void;
}

export function HomeworkScreen({
  isArabic = true,
  defaultSubject = "الرياضيات",
  defaultGrade = "3 ثانوي",
  topSubjects = [],
  topGrades = [],
  onCurriculumUpdate,
}: HomeworkScreenProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [gradeLevel, setGradeLevel] = useState(defaultGrade);
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"ar" | "fr" | "both">("ar");
  const [mode, setMode] = useState<"quick" | "detailed">("detailed");

  const [loading, setLoading] = useState(false);
  const [outputMarkdown, setOutputMarkdown] = useState<string | null>(null);

  const PROGRESS_STEPS = isArabic
    ? [
        "صياغة الهدف البيداغوجي للواجب المنزلي بدقة...",
        "وضع التعليمات والتوجيهات المنهجية للطلاب...",
        "تصميم التمارين التطبيقية المتدرجة الصعوبة...",
        "تقدير المدة الزمنية الواقعية للإنجاز...",
        "تحديد ضوابط التسليم ومعايير التقييم...",
      ]
    : [
        "Formulating specific homework learning objectives...",
        "Drafting clear instructions and methodological guidelines...",
        "Designing graduated difficulty exercises...",
        "Estimating realistic completion duration...",
        "Setting submission deadlines and evaluation criteria...",
      ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error(isArabic ? "يرجى كتابة موضوع الواجب المنزلي" : "Please enter homework topic");
      return;
    }

    setLoading(true);
    setOutputMarkdown(null);

    try {
      const res = await fetch("/api/teacher-generators/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          gradeLevel,
          topic,
          language,
          mode,
          autoSave: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.output) {
        throw new Error(data.error || "Failed to generate homework sheet");
      }

      setOutputMarkdown(data.output);
      onCurriculumUpdate?.(subject, gradeLevel);

      toast.success(
        isArabic
          ? "بطاقة الواجب المنزلي جاهزة للتوزيع مع سلم التنقيط!"
          : "Your homework assignment is prepared and ready to distribute!",
        {
          description: isArabic
            ? "تمت هيكلة الواجب في الأقسام الخمسة النظامية (الأهداف، التعليمات، التمارين، المدة، معايير التسليم)."
            : "Formatted with 5 core homework sections.",
        }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "تعذر توليد الواجب المنزلي");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#831843] via-[#9d174d] to-[#0f172a] p-6 text-white shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-200 border border-pink-400/30">
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>{isArabic ? "الواجبات والتطبيقات المنزلية" : "Take-Home Assignment"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
              {isArabic ? "مولّد بطاقات الواجب المنزلي (5 أقسام)" : "Homework Sheet Generator"}
            </h1>
            <p className="mt-1 text-sm text-pink-100/80">
              {isArabic
                ? "توليد بطاقة واجب منزلي متكاملة تتضمن بدقة الأقسام الخمسة: الهدف، التعليمات، التمارين، المدة التقديرية، وإرشادات التسليم."
                : "Produces standard homework sheets with 5 sections: Objective, Instructions, Exercises, Duration, and Submission."}
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm">
            <span className="text-[11px] text-pink-200 block uppercase tracking-wider">
              {isArabic ? "الأقسام النظامية" : "Sections"}
            </span>
            <span className="text-xl font-bold text-amber-300">5 / 5</span>
            <span className="text-[11px] text-white/60 block">{isArabic ? "أقسام معيارية" : "Ordered Sections"}</span>
          </div>
        </div>
      </div>

      {/* Curriculum Memory */}
      <CurriculumMemoryBar
        currentSubject={subject}
        currentGrade={gradeLevel}
        topSubjects={topSubjects}
        topGrades={topGrades}
        onSelectSubject={(s) => setSubject(s)}
        onSelectGrade={(g) => setGradeLevel(g)}
        isArabic={isArabic}
      />

      {/* Form */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "المادة الدراسية" : "Subject"}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isArabic ? "مثال: الرياضيات، الفيزياء، الأدب العربي..." : "e.g., Mathematics"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "المستوى الدراسي" : "Grade Level"}
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder={isArabic ? "مثال: 2 ثانوي علوم، 1 متوسط..." : "e.g., Grade 11"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "لغة الواجب" : "Language"}
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/15 bg-white/10 p-1">
                {[
                  { id: "ar", label: "عربي" },
                  { id: "fr", label: "Français" },
                  { id: "both", label: isArabic ? "ثنائي" : "Both" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguage(l.id as any)}
                    className={`rounded-lg py-1.5 text-xs font-medium transition ${
                      language === l.id
                        ? "bg-pink-600 text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {isArabic ? "موضوع الواجب المنزلي أو عنوان المحور" : "Homework Topic"}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                isArabic
                  ? "مثال: دراسة اتجاه تغير الدوال العددية وحساب المشتقة، تطور كميات المادة خلال تفاعل أكسدة إرجاع..."
                  : "e.g., Quadratic Equations & Real-world Word Problems"
              }
              required
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">{isArabic ? "طول التكليف:" : "Scope:"}</span>
              <div className="inline-flex rounded-lg border border-white/15 bg-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "quick" ? "bg-amber-500/80 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "قصير (20-30 دقيقة)" : "Quick (20-30m)"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("detailed")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "detailed" ? "bg-pink-600 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "شامل (45-60 دقيقة)" : "Comprehensive (45-60m)"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {loading
                  ? isArabic
                    ? "جاري إعداد بطاقة الواجب..."
                    : "Composing..."
                  : isArabic
                  ? "توليد بطاقة الواجب المنزلي"
                  : "Generate Homework Sheet"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Progress */}
      <GenerationProgressState steps={PROGRESS_STEPS} active={loading} isArabic={isArabic} />

      {/* Output Screen */}
      {outputMarkdown && (
        <div className="space-y-6">
          {/* Warm encouraging confirmation banner */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 to-slate-900/80 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isArabic ? "بطاقة الواجب المنزلي جاهزة للتوزيع مع سلم التنقيط" : "Your homework assignment is prepared and ready to distribute"}
                </h3>
                <p className="text-xs text-emerald-200/80">
                  {isArabic
                    ? "تتضمن الأقسام الخمسة (الهدف، التعليمات، التمارين، المدة، وضوابط التسليم)."
                    : "Formulated across 5 sections ready for printing or classroom posting."}
                </p>
              </div>
            </div>
          </div>

          {/* Export Hub */}
          <ExportHubBar
            title={`واجب منزلي: ${topic}`}
            content={outputMarkdown}
            meta={{ subject, grade: gradeLevel, type: "homework" }}
            isArabic={isArabic}
            isSaved={true}
          />

          {/* Markdown Content */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg">
            <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-white/90">
              {outputMarkdown}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
