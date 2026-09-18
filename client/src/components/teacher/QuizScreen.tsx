import React, { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Check,
  Eye,
  FileCode,
  Layers,
  Copy,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { CurriculumMemoryBar } from "./CurriculumMemoryBar";
import { GenerationProgressState } from "./GenerationProgressState";
import { ExportHubBar } from "./ExportHubBar";

interface QuizScreenProps {
  isArabic?: boolean;
  defaultSubject?: string;
  defaultGrade?: string;
  topSubjects?: string[];
  topGrades?: string[];
  onCurriculumUpdate?: (subject: string, grade: string) => void;
}

interface QuestionItem {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export function QuizScreen({
  isArabic = true,
  defaultSubject = "الرياضيات",
  defaultGrade = "3 ثانوي",
  topSubjects = [],
  topGrades = [],
  onCurriculumUpdate,
}: QuizScreenProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [language, setLanguage] = useState<"ar" | "fr" | "both">("ar");
  const [mode, setMode] = useState<"quick" | "detailed">("detailed");

  const [loading, setLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuestionItem[] | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<"cards" | "json">("cards");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const PROGRESS_STEPS = isArabic
    ? [
        "صياغة الأسئلة المفاهيمية المتوافقة مع الكفاءات المقررة...",
        "تصميم المموهات والمشتتات البديلة (Distractors) باحترافية بيداغوجية...",
        "تدقيق مفاتيح الإجابة الصحيحة...",
        "تحرير التعليلات التربوية الشارحة لكل سؤال...",
      ]
    : [
        "Crafting curriculum-aligned concept questions...",
        "Designing plausible pedagogical distractors...",
        "Validating exact answer keys...",
        "Writing step-by-step pedagogical explanations...",
      ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error(isArabic ? "يرجى كتابة موضوع الاختبار" : "Please enter quiz topic");
      return;
    }

    setLoading(true);
    setQuizQuestions(null);
    setSelectedAnswers({});

    try {
      const res = await fetch("/api/teacher-generators/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          numberOfQuestions,
          language,
          mode,
          gradeLevel: defaultGrade,
          autoSave: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.output?.questions) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      setQuizQuestions(data.output.questions);
      onCurriculumUpdate?.(subject, defaultGrade);

      toast.success(
        isArabic ? "بنك أسئلة QCM جاهز لتقييم طلابك!" : "Your quiz is ready for your learners!",
        {
          description: isArabic
            ? `تم تجهيز ${data.output.questions.length} أسئلة مع خياراتها الأربعة ومفاتيح الحل.`
            : `Generated ${data.output.questions.length} questions with answer keys.`,
        }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "تعذر توليد الاختبار");
    } finally {
      setLoading(false);
    }
  };

  const formattedMarkdown = quizQuestions
    ? `# بنك أسئلة QCM: ${topic}\n**المادة:** ${subject} | **عدد الأسئلة:** ${quizQuestions.length}\n\n` +
      quizQuestions
        .map(
          (q, i) =>
            `### السؤال ${i + 1}: ${q.question}\n` +
            q.options.map((opt, idx) => `  ${String.fromCharCode(65 + idx)}) ${opt}`).join("\n") +
            `\n\n**الإجابة الصحيحة:** ${q.answer}\n**التعليل البيداغوجي:** ${q.explanation}\n`
        )
        .join("\n---\n\n")
    : "";

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#111827] via-[#1e293b] to-[#0f172a] p-6 text-white shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{isArabic ? "التقويم التكويني والتحصيلي" : "Formative Assessment"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
              {isArabic ? "مولّد أسئلة الاختيار من متعدد (QCM Quiz)" : "QCM Quiz Generator"}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {isArabic
                ? "توليد بنك أسئلة متعددة الخيارات مع 4 بدائل دقيقة، وتحديد الإجابة الصحيحة مع تعليل بيداغوجي وتنسيق JSON نظيف."
                : "Produces clean JSON multiple-choice questions with 4 options, exact answers, and pedagogical rationales."}
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm">
            <span className="text-[11px] text-cyan-200 block uppercase tracking-wider">
              {isArabic ? "تنسيق المخرجات" : "Output Format"}
            </span>
            <span className="text-xl font-bold text-emerald-400">Clean JSON</span>
            <span className="text-[11px] text-white/60 block">{isArabic ? "جاهز للتكامل" : "Ready to integrate"}</span>
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
                placeholder={isArabic ? "مثال: الفيزياء، الرياضيات، التاريخ..." : "e.g., Physics"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            {/* Question Count Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/80">
                  {isArabic ? "عدد الأسئلة المطلوبة" : "Question Count"}
                </label>
                <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300">
                  {numberOfQuestions} {isArabic ? "أسئلة" : "Questions"}
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>3 أسئلة (سريع)</span>
                <span>6 أسئلة (قياسي)</span>
                <span>12 سؤال (شامل)</span>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "لغة الأسئلة" : "Language"}
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
                        ? "bg-blue-600 text-white shadow-sm"
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
              {isArabic ? "الموضوع أو المحور المستهدف" : "Target Topic"}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                isArabic
                  ? "مثال: ميكانيكا نيوتن وحركة الأقمار الاصطناعية، التناص والبلاغة في الشعر المعاصر..."
                  : "e.g., Newton's Laws and Gravitational Fields"
              }
              required
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">{isArabic ? "العمق البيداغوجي:" : "Depth:"}</span>
              <div className="inline-flex rounded-lg border border-white/15 bg-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "quick" ? "bg-amber-500/80 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "سريع" : "Quick"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("detailed")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "detailed" ? "bg-blue-600 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "مفصل ومعلل" : "Detailed"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {loading
                  ? isArabic
                    ? "جاري إعداد الأسئلة..."
                    : "Formulating..."
                  : isArabic
                  ? "توليد بنك أسئلة QCM"
                  : "Generate QCM Quiz"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Progress State */}
      <GenerationProgressState steps={PROGRESS_STEPS} active={loading} isArabic={isArabic} />

      {/* Output Screen */}
      {quizQuestions && quizQuestions.length > 0 && (
        <div className="space-y-6">
          {/* Warm encouraging banner */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 to-slate-900/80 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isArabic ? "بنك الأسئلة جاهز لتقييم طلابك" : "Your quiz is ready for your learners"}
                </h3>
                <p className="text-xs text-emerald-200/80">
                  {isArabic
                    ? `تم توليد ${quizQuestions.length} أسئلة باحترافية مع الخيارات ومفاتيح الحل والتعليل البيداغوجي.`
                    : "Validated JSON structure with 4 options per question and complete pedagogical rationales."}
                </p>
              </div>
            </div>
          </div>

          {/* Export Hub Toolbar */}
          <ExportHubBar
            title={`بنك أسئلة QCM: ${topic}`}
            content={formattedMarkdown}
            meta={{ subject, grade: defaultGrade, type: "quiz" }}
            isArabic={isArabic}
            isSaved={true}
          />

          {/* View Mode Toggle: Cards vs JSON */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-white">
              {isArabic ? "استعراض الأسئلة التفاعلية" : "Quiz Questions Review"}
            </h3>
            <div className="flex rounded-lg border border-white/15 bg-white/5 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveViewTab("cards")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
                  activeViewTab === "cards" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{isArabic ? "بطاقات تفاعلية" : "Interactive Cards"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("json")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
                  activeViewTab === "json" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{isArabic ? "شفرة JSON النقية" : "Raw Clean JSON"}</span>
              </button>
            </div>
          </div>

          {activeViewTab === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-1">
              {quizQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-xs font-bold text-blue-300">
                      {idx + 1}
                    </span>
                    <h4 className="flex-1 text-sm font-semibold text-white leading-relaxed">
                      {q.question}
                    </h4>
                  </div>

                  {/* 4 Options */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt === q.answer;
                      return (
                        <div
                          key={oIdx}
                          className={`rounded-xl border p-3 text-xs leading-relaxed transition ${
                            isCorrect
                              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-100 font-medium"
                              : "border-white/10 bg-white/[0.02] text-white/80"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>
                              <strong className="text-white/50 mr-1.5">
                                {String.fromCharCode(65 + oIdx)}.
                              </strong>
                              {opt}
                            </span>
                            {isCorrect && (
                              <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 font-semibold">
                                {isArabic ? "الإجابة الصحيحة" : "Correct"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="mt-3 rounded-xl border border-blue-400/20 bg-blue-950/20 p-3 text-xs text-blue-200/90 leading-relaxed">
                    <strong className="text-blue-300 block mb-1">
                      {isArabic ? "التعليل والبرهان البيداغوجي:" : "Pedagogical Rationale:"}
                    </strong>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify({ questions: quizQuestions }, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
