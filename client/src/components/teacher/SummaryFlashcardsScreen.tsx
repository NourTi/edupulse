import React, { useState } from "react";
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  RotateCw,
  Copy,
  Download,
  FileText,
  FileCode,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { CurriculumMemoryBar } from "./CurriculumMemoryBar";
import { GenerationProgressState } from "./GenerationProgressState";
import { ExportHubBar } from "./ExportHubBar";

interface SummaryFlashcardsScreenProps {
  isArabic?: boolean;
  defaultSubject?: string;
  defaultGrade?: string;
  topSubjects?: string[];
  topGrades?: string[];
  onCurriculumUpdate?: (subject: string, grade: string) => void;
}

interface FlashcardItem {
  front: string;
  back: string;
}

export function SummaryFlashcardsScreen({
  isArabic = true,
  defaultSubject = "الرياضيات",
  defaultGrade = "3 ثانوي",
  topSubjects = [],
  topGrades = [],
  onCurriculumUpdate,
}: SummaryFlashcardsScreenProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [topicOrText, setTopicOrText] = useState("");
  const [language, setLanguage] = useState<"ar" | "fr" | "both">("ar");
  const [mode, setMode] = useState<"quick" | "detailed">("detailed");

  const [loading, setLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const PROGRESS_STEPS = isArabic
    ? [
        "استخلاص المفاهيم المحورية والكلمات المفتاحية من النص...",
        "صياغة ملخص تركيبي مركز وسلس الصياغة...",
        "بناء بطاقات التكرار المتباعد (Spaced Repetition Flashcards)...",
        "مراجعة وضبط الإجابات والتعاريف الدقيقة في خلفية كل بطاقة...",
      ]
    : [
        "Extracting core concepts & keywords...",
        "Synthesizing a concise pedagogical summary paragraph...",
        "Generating spaced-repetition flashcard pairs...",
        "Fine-tuning front prompts and back answers...",
      ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicOrText.trim()) {
      toast.error(isArabic ? "يرجى كتابة الموضوع أو لصق نص الدرس" : "Please enter topic or text");
      return;
    }

    setLoading(true);
    setSummaryText(null);
    setFlashcards([]);
    setFlippedIndex(null);

    try {
      const res = await fetch("/api/teacher-generators/summary-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicOrText,
          subject,
          language,
          mode,
          gradeLevel: defaultGrade,
          autoSave: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.output) {
        throw new Error(data.error || "Failed to generate summary & flashcards");
      }

      setSummaryText(data.output.summary);
      setFlashcards(data.output.flashcards || []);
      onCurriculumUpdate?.(subject, defaultGrade);

      toast.success(
        isArabic
          ? "الملخص والبطاقات الذكية جاهزة لترسيخ التعلمات!"
          : "Your study summary and flashcards are ready!",
        {
          description: isArabic
            ? `تم توليد الملخص المركز مع ${data.output.flashcards.length} بطاقة تعليمية تفاعلية.`
            : `Generated summary paragraph and ${data.output.flashcards.length} flashcards.`,
        }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "تعذر توليد الملخص والبطاقات");
    } finally {
      setLoading(false);
    }
  };

  const formattedMarkdown = summaryText
    ? `# ملخص وبطاقات تعليمية: ${topicOrText.slice(0, 50)}\n**المادة:** ${subject}\n\n## الملخص البيداغوجي المركّز\n${summaryText}\n\n## بطاقات المراجعة الذكية (${flashcards.length} بطاقة)\n` +
      flashcards
        .map(
          (f, idx) =>
            `### بطاقة ${idx + 1}\n- **الواجهة (السؤال/المفهوم):** ${f.front}\n- **الخلفية (التعريف/الجواب):** ${f.back}\n`
        )
        .join("\n")
    : "";

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#581c87] via-[#6b21a8] to-[#0f172a] p-6 text-white shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200 border border-purple-400/30">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>{isArabic ? "التكثيف المعرفي والمراجعة النشطة" : "Active Recall & Synthesis"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
              {isArabic ? "مولّد الملخص والبطاقات التعليمية (Flashcards)" : "Summary & Flashcards Generator"}
            </h1>
            <p className="mt-1 text-sm text-purple-100/80">
              {isArabic
                ? "توليد فقرة ملخص بيداغوجي مركزة متبوعة ببطاقات تفاعلية ذات وجهين (front و back) بتنسيق JSON نظيف."
                : "Produces a concise summary paragraph followed by clean JSON flashcards for spaced repetition."}
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm">
            <span className="text-[11px] text-purple-200 block uppercase tracking-wider">
              {isArabic ? "المخرجات المتزامنة" : "Outputs"}
            </span>
            <span className="text-xl font-bold text-amber-300">Summary + Cards</span>
            <span className="text-[11px] text-white/60 block">{isArabic ? "ملخص + بطاقات تفاعلية" : "Dual Output"}</span>
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

      {/* Form */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "المادة الدراسية" : "Subject"}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isArabic ? "مثال: التاريخ، الجغرافيا، العلوم، الفلسفة..." : "e.g., History"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "اللغة المطلوبة" : "Language"}
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
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic or Uploaded Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-white/80">
                {isArabic ? "الموضوع أو النص المراد تلخيصه واستخراج بطاقاته" : "Topic or Uploaded Text"}
              </label>
              <span className="text-[11px] text-white/40">
                {isArabic ? "يمكنك كتابة موضوع أو لصق نص فقرة دراسية كاملة" : "Topic title or full study text"}
              </span>
            </div>
            <textarea
              rows={4}
              value={topicOrText}
              onChange={(e) => setTopicOrText(e.target.value)}
              placeholder={
                isArabic
                  ? "مثال: الأزمات الدولية الكبرى خلال الحرب الباردة، أو ألصق هنا فقرة من الدرس ليقوم الذكاء بتلخيصها وتحويلها إلى بطاقات أسئلة وأجوبة..."
                  : "e.g., Major treaties of the 20th century or paste raw lesson excerpt here..."
              }
              required
              className="w-full rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-white placeholder-white/35 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">{isArabic ? "نمط البطاقات:" : "Mode:"}</span>
              <div className="inline-flex rounded-lg border border-white/15 bg-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "quick" ? "bg-amber-500/80 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "سريع (6 بطاقات)" : "Quick (6 cards)"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("detailed")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "detailed" ? "bg-purple-600 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "مفصل (10-12 بطاقة)" : "Detailed (10-12 cards)"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {loading
                  ? isArabic
                    ? "جاري التلخيص وبناء البطاقات..."
                    : "Synthesizing..."
                  : isArabic
                  ? "توليد الملخص والبطاقات الذكية"
                  : "Generate Summary & Flashcards"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Progress State */}
      <GenerationProgressState steps={PROGRESS_STEPS} active={loading} isArabic={isArabic} />

      {/* Output Screen */}
      {summaryText && (
        <div className="space-y-6">
          {/* Warm encouraging confirmation banner */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 to-slate-900/80 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isArabic ? "الملخص والبطاقات الذكية جاهزة لترسيخ التعلمات" : "Your study summary and flashcards are ready"}
                </h3>
                <p className="text-xs text-emerald-200/80">
                  {isArabic
                    ? `يتضمن فقرة تلخيص بيداغوجي مركزة متبوعة بـ ${flashcards.length} بطاقة مراجعة تفاعلية.`
                    : "Concise summary paragraph followed by interactive flip flashcards."}
                </p>
              </div>
            </div>
          </div>

          {/* Export Hub */}
          <ExportHubBar
            title={`ملخص وبطاقات: ${topicOrText.slice(0, 45)}`}
            content={formattedMarkdown}
            meta={{ subject, grade: defaultGrade, type: "summary_flashcards" }}
            isArabic={isArabic}
            isSaved={true}
          />

          {/* Summary Card */}
          <div className="rounded-2xl border border-purple-400/30 bg-purple-950/20 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/30 text-xs font-bold text-purple-200">
                &para;
              </span>
              <h3 className="text-sm font-bold text-white">
                {isArabic ? "الملخص البيداغوجي المركّز (Concise Summary Paragraph)" : "Concise Summary Paragraph"}
              </h3>
            </div>
            <p className="text-sm text-purple-100/90 leading-relaxed font-sans">{summaryText}</p>
          </div>

          {/* Flashcards Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                {isArabic
                  ? `بطاقات المراجعة والتكرار المتباعد (${flashcards.length} بطاقة) — اضغط لقلب البطاقة:`
                  : `Interactive Flashcards (${flashcards.length} cards) — Click to flip:`}
              </h3>
              <span className="text-xs text-white/50">{isArabic ? "اضغط على أي بطاقة لعرض الإجابة" : "Click card to flip"}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {flashcards.map((card, idx) => {
                const isFlipped = flippedIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setFlippedIndex(isFlipped ? null : idx)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 min-h-[160px] flex flex-col justify-between select-none ${
                      isFlipped
                        ? "border-emerald-400/50 bg-emerald-950/40 shadow-lg shadow-emerald-950/40"
                        : "border-white/10 bg-white/[0.03] hover:border-purple-400/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-purple-300">
                          {isArabic ? `بطاقة #${idx + 1}` : `Card #${idx + 1}`}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            isFlipped
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          <RotateCw className="h-2.5 w-2.5" />
                          {isFlipped
                            ? isArabic ? "الخلفية (الجواب)" : "Back (Answer)"
                            : isArabic ? "الواجهة (السؤال)" : "Front (Prompt)"}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-white leading-relaxed">
                        {isFlipped ? card.back : card.front}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-white/10 text-[10px] text-white/40 flex justify-between">
                      <span>{isFlipped ? (isArabic ? "انقر للعودة للسؤال" : "Click to view prompt") : (isArabic ? "انقر لإظهار الإجابة" : "Click to reveal answer")}</span>
                      <span>{subject}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
