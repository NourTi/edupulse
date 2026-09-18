import React, { useState } from "react";
import {
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
  Table,
  Check,
  FileText,
  Copy,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { CurriculumMemoryBar } from "./CurriculumMemoryBar";
import { GenerationProgressState } from "./GenerationProgressState";
import { ExportHubBar } from "./ExportHubBar";

interface RubricScreenProps {
  isArabic?: boolean;
  defaultSubject?: string;
  defaultGrade?: string;
  topSubjects?: string[];
  topGrades?: string[];
  onCurriculumUpdate?: (subject: string, grade: string) => void;
}

const COMMON_ASSIGNMENT_TYPES_AR = [
  "تحليل مقال فلسفي أو أدبي",
  "تقرير مخبري تجريبي",
  "حل وضعية مشكلة إدماجية",
  "عرض تقديمي شفهي",
  "مشروع بحثي جماعي",
  "اختبار فرضي تركيبي",
];

const COMMON_ASSIGNMENT_TYPES_EN = [
  "Analytical Essay",
  "Laboratory Experiment Report",
  "Complex Problem Solving",
  "Oral Presentation",
  "Group Research Project",
  "Synthesis Examination",
];

export function RubricScreen({
  isArabic = true,
  defaultSubject = "الرياضيات",
  defaultGrade = "3 ثانوي",
  topSubjects = [],
  topGrades = [],
  onCurriculumUpdate,
}: RubricScreenProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [topic, setTopic] = useState("");
  const [assignmentType, setAssignmentType] = useState(
    isArabic ? COMMON_ASSIGNMENT_TYPES_AR[2] : COMMON_ASSIGNMENT_TYPES_EN[2]
  );
  const [language, setLanguage] = useState<"ar" | "fr" | "both">("ar");
  const [mode, setMode] = useState<"quick" | "detailed">("detailed");

  const [loading, setLoading] = useState(false);
  const [outputMarkdown, setOutputMarkdown] = useState<string | null>(null);

  const PROGRESS_STEPS = isArabic
    ? [
        "تحديد المعايير الكبرى للتقييم الموضوعي...",
        "معايرة مستويات الأداء: ممتاز، جيد، متوسط، يحتاج إلى تحسين...",
        "تحرير مؤشرات النجاح والتوصيفات الدقيقة لكل خانة...",
        "ضبط توزيع الأوزان النسبية وسلم التنقيط...",
      ]
    : [
        "Establishing major pedagogical evaluation criteria...",
        "Calibrating performance levels: Excellent, Good, Fair, Needs Improvement...",
        "Writing specific observable descriptors per cell...",
        "Finalizing weighting and scoring guidelines...",
      ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !assignmentType.trim()) {
      toast.error(isArabic ? "يرجى كتابة الموضوع ونوع التقييم" : "Please enter topic and assignment type");
      return;
    }

    setLoading(true);
    setOutputMarkdown(null);

    try {
      const res = await fetch("/api/teacher-generators/rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          assignmentType,
          language,
          mode,
          gradeLevel: defaultGrade,
          autoSave: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.output) {
        throw new Error(data.error || "Failed to generate rubric");
      }

      setOutputMarkdown(data.output);
      onCurriculumUpdate?.(subject, defaultGrade);

      toast.success(
        isArabic
          ? "سلم التقييم جاهز للتحكيم والتقويم الموضوعي!"
          : "Your rubric is ready to share with students!",
        {
          description: isArabic
            ? `تم ضبط معايير ومستويات الأداء لمهمة "${assignmentType}".`
            : "Criteria table formatted with 4 distinct performance levels.",
        }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "تعذر توليد سلم التقييم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0f172a] p-6 text-white shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>{isArabic ? "التقييم المعياري الشفاف" : "Standardized Evaluation"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
              {isArabic ? "مولّد سلالم التقييم التحليلية (Rubrics)" : "Rubric Generator"}
            </h1>
            <p className="mt-1 text-sm text-indigo-100/80">
              {isArabic
                ? "توليد جداول تقييم تفصيلية تضم المعايير الأساسية كصفوف ومستويات الأداء الأربعة (ممتاز، جيد، متوسط، يحتاج تحسين) كأعمدة."
                : "Produces analytic rubric tables with criteria rows and 4 clear performance level columns with descriptors."}
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm">
            <span className="text-[11px] text-cyan-200 block uppercase tracking-wider">
              {isArabic ? "مستويات الأداء" : "Levels"}
            </span>
            <span className="text-xl font-bold text-amber-300">4 Levels</span>
            <span className="text-[11px] text-white/60 block">{isArabic ? "ممتاز ← يحتاج تحسين" : "Excellent to Fair"}</span>
          </div>
        </div>
      </div>

      {/* Curriculum Memory */}
      <CurriculumMemoryBar
        currentSubject={subject}
        currentGrade={defaultGrade}
        topSubjects={topSubjects}
        topGrades={topGrades}
        onSelectSubject={(s) => setSubject(s)}
        onSelectGrade={() => {}}
        isArabic={isArabic}
      />

      {/* Single Focused Form */}
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
                placeholder={isArabic ? "مثال: الرياضيات، التاريخ، اللغة الإنجليزية..." : "e.g., Biology"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            {/* Assignment Type Custom Input */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "نوع المهمة أو التكليف" : "Assignment Type"}
              </label>
              <input
                type="text"
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
                placeholder={isArabic ? "مثال: تقرير تجريبي، مقال تحليلي..." : "e.g., Lab Report"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "لغة سلم التقييم" : "Language"}
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
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Assignment Type Chips */}
          <div>
            <span className="text-white/60 text-xs block mb-2">
              {isArabic ? "نماذج المهام الشائعة للاختيار السريع:" : "Quick assignment presets:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {(isArabic ? COMMON_ASSIGNMENT_TYPES_AR : COMMON_ASSIGNMENT_TYPES_EN).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAssignmentType(type)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    assignmentType === type
                      ? "bg-indigo-500 text-white font-medium shadow-sm"
                      : "bg-white/5 text-white/70 hover:bg-white/15 border border-white/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {isArabic ? "الموضوع أو المحور المراد تقييمه" : "Topic to Evaluate"}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                isArabic
                  ? "مثال: مهارة التحليل البلاغي في النص النثري، حل مسألة الاحتمالات الشرطية والمتغيرات العشوائية..."
                  : "e.g., Chemical Kinetics & Reaction Rates"
              }
              required
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">{isArabic ? "درجة التفصيل:" : "Detail Level:"}</span>
              <div className="inline-flex rounded-lg border border-white/15 bg-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "quick" ? "bg-amber-500/80 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "سريع وموجز" : "Quick"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("detailed")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "detailed" ? "bg-indigo-600 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "مفصل ومعياري" : "Detailed"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {loading
                  ? isArabic
                    ? "جاري بناء سلم التقييم..."
                    : "Structuring..."
                  : isArabic
                  ? "توليد سلم التقييم التحليلي"
                  : "Generate Rubric"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Progress State */}
      <GenerationProgressState steps={PROGRESS_STEPS} active={loading} isArabic={isArabic} />

      {/* Output Display */}
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
                  {isArabic ? "سلم التقييم جاهز للتحكيم والتقويم الموضوعي" : "Your rubric is ready to share with students"}
                </h3>
                <p className="text-xs text-emerald-200/80">
                  {isArabic
                    ? `يتضمن معايير واضحة ومستويات تحصيلية متدرجة لمهمة "${assignmentType}".`
                    : "Objective criteria formatted in Markdown table ready for classroom and assessment use."}
                </p>
              </div>
            </div>
          </div>

          {/* Export Hub */}
          <ExportHubBar
            title={`سلم تقييم (${assignmentType}): ${topic}`}
            content={outputMarkdown}
            meta={{ subject, grade: defaultGrade, type: "rubric" }}
            isArabic={isArabic}
            isSaved={true}
          />

          {/* Markdown Content Table Render */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg overflow-x-auto">
            <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {outputMarkdown}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
