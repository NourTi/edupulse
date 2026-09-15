import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Layers,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  FileText,
  Download,
  Eye,
  Code2,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type QuizResponse = {
  questions: QuizQuestion[];
};

export type Flashcard = {
  front: string;
  back: string;
};

export type FlashcardsResponse = {
  flashcards: Flashcard[];
};

interface StudyAssessmentGeneratorProps {
  isArabic: boolean;
  initialStudyText?: string;
  initialTitle?: string;
  onBackToPlans?: () => void;
}

export function StudyAssessmentGenerator({
  isArabic,
  initialStudyText,
  initialTitle,
  onBackToPlans,
}: StudyAssessmentGeneratorProps) {
  const [studyText, setStudyText] = useState<string>(initialStudyText || "");
  const [activeTab, setActiveTab] = useState<"quiz" | "flashcards">("quiz");

  // Quiz configuration & state
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(6);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [quizViewMode, setQuizViewMode] = useState<"interactive" | "json">("interactive");

  // Flashcards configuration & state
  const [flashcardCount, setFlashcardCount] = useState<number>(12);
  const [flashcardsData, setFlashcardsData] = useState<FlashcardsResponse | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [flashcardsViewMode, setFlashcardsViewMode] = useState<"deck" | "grid" | "json">("deck");

  // Copy state
  const [copiedQuiz, setCopiedQuiz] = useState(false);
  const [copiedFlashcards, setCopiedFlashcards] = useState(false);

  // Update text when initialStudyText changes
  useEffect(() => {
    if (initialStudyText) {
      setStudyText(initialStudyText);
    }
  }, [initialStudyText]);

  // Mutations
  const quizMutation = trpc.study.generateQuiz.useMutation({
    onSuccess: (data) => {
      setQuizData(data as QuizResponse);
      setSelectedAnswers({});
      setShowExplanations({});
      toast.success(
        isArabic
          ? `تم بنجاح توليد ${data.questions.length} أسئلة اختبار متعددة الخيارات.`
          : `Successfully generated ${data.questions.length} multiple-choice quiz questions.`
      );
    },
    onError: (err) => {
      toast.error(err.message || (isArabic ? "تعذر توليد أسئلة الاختبار." : "Failed to generate quiz."));
    },
  });

  const flashcardsMutation = trpc.study.generateFlashcards.useMutation({
    onSuccess: (data) => {
      setFlashcardsData(data as FlashcardsResponse);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      toast.success(
        isArabic
          ? `تم بنجاح توليد ${data.flashcards.length} بطاقة استذكار غير متداخلة.`
          : `Successfully generated ${data.flashcards.length} non-overlapping flashcards.`
      );
    },
    onError: (err) => {
      toast.error(err.message || (isArabic ? "تعذر توليد بطاقات الاستذكار." : "Failed to generate flashcards."));
    },
  });

  const handleGenerateQuiz = () => {
    if (!studyText.trim()) {
      toast.error(isArabic ? "يرجى إدخال أو تحديد نص الدرس أولاً." : "Please enter or provide study text first.");
      return;
    }
    quizMutation.mutate({
      text: studyText.trim(),
      count: quizQuestionCount,
      language: isArabic ? "ar" : "en",
    });
  };

  const handleGenerateFlashcards = () => {
    if (!studyText.trim()) {
      toast.error(isArabic ? "يرجى إدخال أو تحديد نص الدرس أولاً." : "Please enter or provide study text first.");
      return;
    }
    flashcardsMutation.mutate({
      text: studyText.trim(),
      count: flashcardCount,
      language: isArabic ? "ar" : "en",
    });
  };

  const handleCopyQuizJson = () => {
    if (!quizData) return;
    const jsonStr = JSON.stringify(quizData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedQuiz(true);
    toast.success(isArabic ? "تم نسخ كود JSON للكويز بدقة." : "Quiz JSON copied to clipboard.");
    setTimeout(() => setCopiedQuiz(false), 2000);
  };

  const handleCopyFlashcardsJson = () => {
    if (!flashcardsData) return;
    const jsonStr = JSON.stringify(flashcardsData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedFlashcards(true);
    toast.success(isArabic ? "تم نسخ كود JSON للبطاقات بدقة." : "Flashcards JSON copied to clipboard.");
    setTimeout(() => setCopiedFlashcards(false), 2000);
  };

  const handleDownloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOptionSelect = (qIdx: number, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
    setShowExplanations((prev) => ({ ...prev, [qIdx]: true }));
  };

  // Preset curriculum texts for quick testing if user hasn't loaded a plan
  const loadPreset = (type: "biology" | "history" | "philosophy" | "math") => {
    if (type === "biology") {
      setStudyText(
        `تتميز الاستجابة المناعية الخلطية بإنتاج أجسام مضادة نوعية (Immunoglobulins) من قبل الخلايا البلازمية (Plasmocytes)، الناتجة عن تمايز الخلايا اللمفاوية B بعد تنشيطها بالإنترلوكين 2 (IL-2) المفرز من الخلايا التائية المساعدة LT4. يمتلك كل جسم مضاد موقعين متماثلين لتثبيت محدد المستضد، يتشكل المعقد المناعي (Antigen-Antibody Complex) بتكامل بنيوي نوعي، مما يؤدي إلى إبطال مفعول المستضد وتسهيل بلعمته بواسطة البالعات الكبيرة.`
      );
    } else if (type === "history") {
      setStudyText(
        `عقد مؤتمر الصومام في 20 أوت 1956 بقرية إيفري أوزلاقن بالولاية الثالثة التاريخية، وشكل منعرجاً حاسماً في مسار الثورة التحريرية الجزائرية. أقر المؤتمر مبدأ أولوية الداخل على الخارج وأولوية العمل السياسي على العمل العسكري، كما قسم التراب الوطني إلى ست ولايات عسكرية وأنشأ المجلس الوطني للثورة الجزائرية (CNRA) ولجنة التنسيق والتنفيذ (CCE)، مما أعطى الثورة هيكلة مؤسساتية محكمة عجلت بالاعتراف الدولي.`
      );
    } else if (type === "philosophy") {
      setStudyText(
        `يمثل الإدراك الحسي عملية عقلية عليا لتأويل المنبهات الحسية وإضفاء المعنى عليها. يرى المذهب العقلاني بزعامة ديكارت وآلان أن الإدراك حكم عقلي خالص ومستقل عن خداع الحواس، مستدلين بالمكعب الذي نرى منه ثلاثة أوجه وندرك أنه ذو ستة أوجه بالعقل. في المقابل، يرى التجريبيون بزعامة دافيد هيوم وجون لوك أن العقل صفحة بيضاء وأن الحواس هي المصدر الوحيد والأساس لكل معرفة فطرية.`
      );
    } else {
      setStudyText(
        `التحليل الكهربائي البسيط لمحلول كلور القصدير (SnCl2) يتم بمسريين من الغرافيت لا يشاركان في التفاعل. عند غلق الدارة، تهاجر شوارد القصدير الموجبة Sn2+ نحو المهبط (القطب السالب) لتكتسب إلكترونين وتتحول إلى ذرات قصدير تترسب على شكل شعيرات معدنية فضية. بينما تتجه شوارد الكلور السالبة Cl- نحو المصعد (القطب الموجب) لتفقد إلكترونات وتتحول إلى جزيئات غاز الكلور Cl2 المتميز بلونه الأخضر المصفر ورائحته الخانقة.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Source Text Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                {isArabic ? "مولد التقييم والاستذكار الذكي" : "Pedagogical Assessment & Recall Generator"}
                {initialTitle && (
                  <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {initialTitle}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isArabic
                  ? "توليد كويزات تقييمية خالية من الهلوسة وبطاقات فلاشكاردز نشطة استناداً حصرياً إلى نص الدرس المدروس."
                  : "Generate hallucination-free multiple-choice quizzes and active-recall flashcards strictly grounded in study text."}
              </p>
            </div>
          </div>

          {onBackToPlans && (
            <button
              onClick={onBackToPlans}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {isArabic ? "العودة إلى الجذاذات" : "Back to Lesson Plans"}
            </button>
          )}
        </div>

        {/* Input Study Text Field */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-violet-600" />
              {isArabic ? "نص الدرس أو المحتوى البيداغوجي المرجعي:" : "Study Text / Lesson Curriculum Content:"}
            </label>

            {/* Quick preset loaders */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[11px] font-medium">{isArabic ? "نماذج سريعة:" : "Quick Samples:"}</span>
              <button
                type="button"
                onClick={() => loadPreset("biology")}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                {isArabic ? "المناعة 3AS" : "Biology"}
              </button>
              <button
                type="button"
                onClick={() => loadPreset("history")}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                {isArabic ? "تاريخ الثورة" : "History"}
              </button>
              <button
                type="button"
                onClick={() => loadPreset("philosophy")}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                {isArabic ? "فلسفة الإدراك" : "Philosophy"}
              </button>
              <button
                type="button"
                onClick={() => loadPreset("math")}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                {isArabic ? "فيزياء BEM" : "Physics"}
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={studyText}
            onChange={(e) => setStudyText(e.target.value)}
            placeholder={
              isArabic
                ? "ألصق هنا النص الدراسي، أو عناصر الدرس، أو الفقرات التحصيلية ليتم تحويلها مباشرة إلى أسئلة اختبار أو بطاقات استذكار..."
                : "Paste your study text, lesson notes, or curricular paragraphs here to transform them into grounded quiz questions or flashcards..."
            }
            className="w-full text-xs font-mono md:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
          />

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500">
            <span>
              {isArabic ? "عدد الحروف:" : "Character count:"} {studyText.length} ·{" "}
              {isArabic ? "عدد الكلمات التقديري:" : "Approx. words:"}{" "}
              {studyText.trim() ? studyText.trim().split(/\s+/).length : 0}
            </span>
            <span className="text-slate-400">
              {isArabic
                ? "يتم الحفاظ على التناسق المعرفي دون خروج عن النص"
                : "Strictly grounded solely in the provided input"}
            </span>
          </div>
        </div>
      </div>

      {/* Generator Navigation & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Main Mode Switcher: Quiz vs Flashcards */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("quiz")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "quiz"
                  ? "bg-white text-violet-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-violet-600" />
              {isArabic ? "مولد الكويز (5–10 أسئلة)" : "Quiz Generator (5–10 Qs)"}
              {quizData && (
                <span className="bg-violet-100 text-violet-700 px-1.5 py-0.2 rounded-full text-[10px]">
                  {quizData.questions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("flashcards")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "flashcards"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              {isArabic ? "مولد البطاقات (10–15 بطاقة)" : "Flashcards (10–15 Cards)"}
              {flashcardsData && (
                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full text-[10px]">
                  {flashcardsData.flashcards.length}
                </span>
              )}
            </button>
          </div>

          {/* Action trigger button */}
          <div className="flex items-center gap-3">
            {activeTab === "quiz" ? (
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 font-medium">
                  {isArabic ? "عدد الأسئلة:" : "Question count:"}
                </label>
                <select
                  value={quizQuestionCount}
                  onChange={(e) => setQuizQuestionCount(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-bold outline-none"
                >
                  <option value={5}>5 أسئلة (Standard)</option>
                  <option value={6}>6 أسئلة (Recommended)</option>
                  <option value={8}>8 أسئلة (Comprehensive)</option>
                  <option value={10}>10 أسئلة (Full BAC / BEM Quiz)</option>
                </select>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={quizMutation.isPending || !studyText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition disabled:opacity-50"
                >
                  {quizMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isArabic ? "توليد الكويز الآن" : "Generate Quiz"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 font-medium">
                  {isArabic ? "عدد البطاقات:" : "Card count:"}
                </label>
                <select
                  value={flashcardCount}
                  onChange={(e) => setFlashcardCount(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-bold outline-none"
                >
                  <option value={10}>10 بطاقات</option>
                  <option value={12}>12 بطاقة (Optimal)</option>
                  <option value={15}>15 بطاقة (Deep Mastery)</option>
                </select>

                <button
                  onClick={handleGenerateFlashcards}
                  disabled={flashcardsMutation.isPending || !studyText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {flashcardsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isArabic ? "توليد البطاقات الآن" : "Generate Flashcards"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: QUIZ VIEW                                                     */}
      {/* ========================================================================= */}
      {activeTab === "quiz" && (
        <div className="space-y-4">
          {quizMutation.isPending && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">
                {isArabic ? "جاري قراءة النص وتحليل المفاهيم وتوليد الأسئلة..." : "Analyzing text & generating multiple-choice quiz..."}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isArabic
                  ? "يتم اشتقاق 4 خيارات لكل سؤال بدقة وبدون أي معلومات خارجية."
                  : "Deriving 4 precise options, correct answer, and explanation based strictly on the text."}
              </p>
            </div>
          )}

          {!quizMutation.isPending && quizData && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-6">
              {/* Header with Export & View Mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-900">
                    {isArabic
                      ? `تم تجهيز ${quizData.questions.length} أسئلة اختبار`
                      : `${quizData.questions.length} Multiple-Choice Questions Ready`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Interactive vs JSON */}
                  <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setQuizViewMode("interactive")}
                      className={`px-3 py-1 rounded-md font-semibold ${
                        quizViewMode === "interactive" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 inline ml-1 mr-1" />
                      {isArabic ? "عرض تفاعلي" : "Interactive"}
                    </button>
                    <button
                      onClick={() => setQuizViewMode("json")}
                      className={`px-3 py-1 rounded-md font-semibold ${
                        quizViewMode === "json" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 inline ml-1 mr-1" />
                      {isArabic ? "كود JSON النظيف" : "Clean JSON"}
                    </button>
                  </div>

                  <button
                    onClick={handleCopyQuizJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    {copiedQuiz ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedQuiz ? (isArabic ? "تم النسخ" : "Copied") : isArabic ? "نسخ JSON" : "Copy JSON"}
                  </button>

                  <button
                    onClick={() => handleDownloadJson(quizData, "study-quiz-questions.json")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isArabic ? "تحميل JSON" : "Download"}
                  </button>
                </div>
              </div>

              {/* View Mode: Interactive */}
              {quizViewMode === "interactive" ? (
                <div className="space-y-6">
                  {quizData.questions.map((q, qIdx) => {
                    const selected = selectedAnswers[qIdx];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === q.answer;

                    return (
                      <div
                        key={qIdx}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 md:p-5 space-y-4 hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {qIdx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h4>
                          </div>

                          {isAnswered && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> {isArabic ? "صحيح" : "Correct"}
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" /> {isArabic ? "غير دقيق" : "Incorrect"}
                                </>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Options List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isThisSelected = selected === opt;
                            const isThisCorrect = opt === q.answer;

                            let btnStyle = "bg-white hover:bg-slate-100 text-slate-800 border-slate-200";

                            if (isAnswered) {
                              if (isThisCorrect) {
                                btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400";
                              } else if (isThisSelected) {
                                btnStyle = "bg-rose-50 border-rose-300 text-rose-900 font-medium";
                              } else {
                                btnStyle = "bg-white text-slate-400 border-slate-200 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleOptionSelect(qIdx, opt)}
                                className={`flex items-start text-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed transition ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                                  {["أ", "ب", "ج", "د"][optIdx] || String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {showExplanations[qIdx] && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-3 rounded-xl bg-violet-50/70 border border-violet-100 text-xs text-violet-950 flex items-start gap-2"
                          >
                            <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">{isArabic ? "التبرير البيداغوجي: " : "Pedagogical Explanation: "}</span>
                              <span>{q.explanation}</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* View Mode: Clean JSON Output */
                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px]">
                    {JSON.stringify(quizData, null, 2)}
                  </pre>
                  <button
                    onClick={handleCopyQuizJson}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono flex items-center gap-1.5"
                  >
                    {copiedQuiz ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuiz ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!quizMutation.isPending && !quizData && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                {isArabic
                  ? "اضغط على زر 'توليد الكويز الآن' أعلاه لتحويل النص الدراسي إلى 5-10 أسئلة متعددة الخيارات مطابقة للمعايير."
                  : "Click 'Generate Quiz' above to convert your study text into 5-10 multiple-choice questions."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: FLASHCARDS VIEW                                               */}
      {/* ========================================================================= */}
      {activeTab === "flashcards" && (
        <div className="space-y-4">
          {flashcardsMutation.isPending && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">
                {isArabic
                  ? "جاري استخراج المصطلحات والمفاهيم وتوليد بطاقات الاستذكار..."
                  : "Extracting key terms & generating non-overlapping flashcards..."}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isArabic
                  ? "يتم تركيب 10 إلى 15 بطاقة استذكار تغطي المضمون دون تكرار."
                  : "Generating 10 to 15 non-overlapping active-recall cards with front and back definitions."}
              </p>
            </div>
          )}

          {!flashcardsMutation.isPending && flashcardsData && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-6">
              {/* Header with Export & View Mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-900">
                    {isArabic
                      ? `تم توليد ${flashcardsData.flashcards.length} بطاقة استذكار نشطة`
                      : `${flashcardsData.flashcards.length} Active-Recall Flashcards Ready`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Switcher: Deck vs Grid vs JSON */}
                  <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setFlashcardsViewMode("deck")}
                      className={`px-3 py-1 rounded-md font-semibold ${
                        flashcardsViewMode === "deck" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 inline ml-1 mr-1" />
                      {isArabic ? "وضع البطاقات الفردي" : "Deck"}
                    </button>
                    <button
                      onClick={() => setFlashcardsViewMode("grid")}
                      className={`px-3 py-1 rounded-md font-semibold ${
                        flashcardsViewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 inline ml-1 mr-1" />
                      {isArabic ? "عرض شبكي للكل" : "Grid"}
                    </button>
                    <button
                      onClick={() => setFlashcardsViewMode("json")}
                      className={`px-3 py-1 rounded-md font-semibold ${
                        flashcardsViewMode === "json" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 inline ml-1 mr-1" />
                      {isArabic ? "كود JSON النظيف" : "Clean JSON"}
                    </button>
                  </div>

                  <button
                    onClick={handleCopyFlashcardsJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    {copiedFlashcards ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFlashcards ? (isArabic ? "تم النسخ" : "Copied") : isArabic ? "نسخ JSON" : "Copy JSON"}
                  </button>

                  <button
                    onClick={() => handleDownloadJson(flashcardsData, "study-flashcards.json")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isArabic ? "تحميل JSON" : "Download"}
                  </button>
                </div>
              </div>

              {/* View Mode: Deck Mode (Interactive Flippable Card) */}
              {flashcardsViewMode === "deck" && (
                <div className="max-w-xl mx-auto space-y-4">
                  {/* Card Navigation Controls */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>
                      {isArabic ? "البطاقة رقم" : "Card"} {currentCardIndex + 1} / {flashcardsData.flashcards.length}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {isArabic ? "انقر على البطاقة أو الزر لقلب الوجه" : "Click card or button to flip"}
                    </span>
                  </div>

                  {/* Flippable 3D Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer select-none perspective-1000 min-h-[260px] relative rounded-2xl border-2 border-slate-300/80 bg-gradient-to-br from-white to-slate-50/80 shadow-md p-6 flex flex-col justify-between hover:border-emerald-400 transition duration-200"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isFlipped
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-violet-100 text-violet-800"
                        }`}
                      >
                        {isFlipped
                          ? isArabic
                            ? "الظهر (التعريف / الإجابة)"
                            : "Back (Definition / Answer)"
                          : isArabic
                          ? "الوجه (المصطلح / السؤال)"
                          : "Front (Term / Prompt)"}
                      </span>

                      <RotateCcw className="w-4 h-4 text-slate-400 hover:text-slate-600 transition" />
                    </div>

                    <div className="my-auto py-6 text-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isFlipped ? "back" : "front"}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          <p
                            className={`font-bold leading-relaxed ${
                              isFlipped
                                ? "text-sm md:text-base text-slate-800 font-normal"
                                : "text-base md:text-lg text-slate-900"
                            }`}
                          >
                            {isFlipped
                              ? flashcardsData.flashcards[currentCardIndex]?.back
                              : flashcardsData.flashcards[currentCardIndex]?.front}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="text-center text-[11px] text-slate-400">
                      {isArabic ? "اضغط لقلب البطاقة" : "Tap to flip"}
                    </div>
                  </div>

                  {/* Navigation Buttons: Previous / Flip / Next */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) =>
                          prev > 0 ? prev - 1 : flashcardsData.flashcards.length - 1
                        );
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
                      title={isArabic ? "السابق" : "Previous"}
                    >
                      <ChevronRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
                    </button>

                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isArabic ? "قلب البطاقة" : "Flip Card"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) =>
                          prev < flashcardsData.flashcards.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
                      title={isArabic ? "التالي" : "Next"}
                    >
                      <ChevronLeft className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* View Mode: Grid Mode (All Cards Shown) */}
              {flashcardsViewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {flashcardsData.flashcards.map((card, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 flex flex-col justify-between hover:bg-white hover:shadow-xs transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-violet-700">#{idx + 1}</span>
                          <span className="bg-violet-100 text-violet-800 px-1.5 py-0.2 rounded text-[10px]">
                            {isArabic ? "المصطلح" : "Front"}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">{card.front}</h5>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 space-y-1">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px] font-medium">
                          {isArabic ? "الشرح / المفهوم" : "Back"}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">{card.back}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View Mode: Clean JSON Output */}
              {flashcardsViewMode === "json" && (
                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px]">
                    {JSON.stringify(flashcardsData, null, 2)}
                  </pre>
                  <button
                    onClick={handleCopyFlashcardsJson}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono flex items-center gap-1.5"
                  >
                    {copiedFlashcards ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFlashcards ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!flashcardsMutation.isPending && !flashcardsData && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                {isArabic
                  ? "اضغط على زر 'توليد البطاقات الآن' أعلاه لإنشاء 10-15 بطاقة استذكار نشطة تركز على المصطلحات الأساسية."
                  : "Click 'Generate Flashcards' above to generate 10-15 active recall cards focusing on key concepts."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
