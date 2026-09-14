import React, { useState } from "react";
import {
  Binary,
  Calculator,
  Search,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sigma,
  Atom,
  Cpu,
  ArrowRight,
  GraduationCap,
  BookOpen,
  FileCheck,
  Lightbulb,
  Copy,
  Check,
  Layers,
  FlaskConical,
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";

interface WolframStemSolverProps {
  isArabic?: boolean;
  userRole?: string;
}

export function WolframStemSolver({ isArabic = true, userRole = "student" }: WolframStemSolverProps) {
  const isTeacherRole = userRole === "teacher" || userRole === "admin" || userRole === "counsellor";
  const [activePortal, setActivePortal] = useState<"student" | "teacher">(isTeacherRole ? "teacher" : "student");
  const [category, setCategory] = useState<"all" | "calculus" | "algebra" | "physics" | "chemistry">("all");
  const [queryInput, setQueryInput] = useState("integrate x * exp(x) dx");
  const [searchedQuery, setSearchedQuery] = useState("integrate x * exp(x) dx");
  const [copied, setCopied] = useState(false);

  const wolframQuery = trpc.integrations.wolframAlpha.useQuery(
    { query: searchedQuery },
    { enabled: Boolean(searchedQuery) }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setSearchedQuery(queryInput.trim());
  };

  const handleCopySolution = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(isArabic ? "تم نسخ الحل الرياضي بالكامل" : "Full solution copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const studentQueries = [
    { label: "تكامل بالدوال الأسية (BAC)", q: "integrate x * e^x dx", cat: "calculus" },
    { label: "اشتقاق ودراسة إشارة الدالة", q: "derivative of ln(x^2 + 1)", cat: "calculus" },
    { label: "حل معادلة تفاضلية من الدرجة الأولى", q: "solve y' + 2y = 4", cat: "calculus" },
    { label: "حساب سرعة الإفلات وثوابت الجاذبية", q: "escape velocity of Earth in km/s", cat: "physics" },
    { label: "موازنة تفاعل أكسدة إرجاعية", q: "balance MnO4- + Fe2+ + H+ -> Mn2+ + Fe3+ + H2O", cat: "chemistry" },
    { label: "نهايات الدوال الجذرية عند اللانهاية", q: "limit (sqrt(x^2 + 3x) - x) as x -> infinity", cat: "calculus" },
  ];

  const teacherQueries = [
    { label: "صياغة تمرين دوال لوغاريتمية مع مناقشة بيانية", q: "properties and inflection points of f(x) = (x-1)*ln(x)", cat: "calculus" },
    { label: "اشتقاق معادلة حركة نواس مرن بدون احتكاك", q: "equation of motion simple harmonic oscillator d2x/dt2 + w^2 x = 0", cat: "physics" },
    { label: "توليد مصفوفة معاملات وحلها بطريقة غاوس", q: "row reduce {{2, 1, -1, 8}, {-3, -1, 2, -11}, {-2, 1, 2, -3}}", cat: "algebra" },
    { label: "توليد سلم تنقيط لسؤال متتاليات تراجعية", q: "sequence a(n+1) = (2*a(n) + 3)/5, a(0) = 1 limit and closed form", cat: "algebra" },
    { label: "حساب pH محلول حمض ضعيف وقاعدة قوية", q: "pH of 0.1 M CH3COOH titrated with 0.1 M NaOH", cat: "chemistry" },
  ];

  const currentQueries = (activePortal === "teacher" ? teacherQueries : studentQueries).filter(
    (q) => category === "all" || q.cat === category
  );

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-orange-950 to-red-950 p-6 text-white shadow-sm border border-orange-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300 border border-orange-400/30">
              <Binary className="h-3.5 w-3.5" />
              <span>{isArabic ? "محرك Wolfram|Alpha الحسابي ومساعد STEM المتقدم" : "Wolfram|Alpha STEM Computational Engine"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              {activePortal === "teacher"
                ? isArabic ? "بوابة الأستاذ الحسابية والبرهان الدقيق" : "Teacher STEM Pedagogical Solver"
                : isArabic ? "بوابة الطالب لحل المعادلات والمسائل بالخطوات" : "Student STEM Step-by-Step Solver"}
            </h1>
            <p className="mt-1 text-sm text-orange-200/80 max-w-3xl">
              {activePortal === "teacher"
                ? isArabic
                  ? "أداة الأستاذ المتقدمة لصياغة نماذج الفروض، استخراج البراهين والاشتقاقات الصارمة، التحقق من نتائج المتتاليات والدوال، وبناء سلالم التنقيط."
                  : "Advanced verification for educators: generate exam variants, strict symbolic proofs, syllabus derivations, and grading rubrics."
                : isArabic
                  ? "حل دقيق بالخطوات التفصيلية للمعادلات، حساب التكاملات، دراسة الدوال، قوانين الفيزياء، وموازنة التفاعلات الكيميائية."
                  : "Step-by-step mathematical reasoning, symbolic integration, physics derivations, and chemistry balancing for learners."}
            </p>
          </div>

          {/* Portal Switcher (Student vs Teacher) */}
          <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-xl border border-white/15 backdrop-blur-sm self-start md:self-auto">
            <button
              onClick={() => setActivePortal("student")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activePortal === "student"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-orange-200 hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{isArabic ? "بوابة الطالب" : "Student Portal"}</span>
            </button>
            <button
              onClick={() => setActivePortal("teacher")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activePortal === "teacher"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-orange-200 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isArabic ? "بوابة الأستاذ" : "Teacher Portal"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input & Search Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">{isArabic ? "التصنيف:" : "Discipline:"}</span>
          <button
            onClick={() => setCategory("all")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              category === "all" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isArabic ? "الكل" : "All"}
          </button>
          <button
            onClick={() => setCategory("calculus")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              category === "calculus" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            ∫ {isArabic ? "التحليل والتكاملات" : "Calculus"}
          </button>
          <button
            onClick={() => setCategory("algebra")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              category === "algebra" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            ∑ {isArabic ? "الجبر والمتتاليات" : "Algebra & Sequences"}
          </button>
          <button
            onClick={() => setCategory("physics")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              category === "physics" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            ⚛️ {isArabic ? "الفيزياء والميكانيك" : "Physics"}
          </button>
          <button
            onClick={() => setCategory("chemistry")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              category === "chemistry" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            ⚗️ {isArabic ? "الكيمياء والمحاليل" : "Chemistry"}
          </button>
        </div>

        {/* Freeform Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Sigma className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                activePortal === "teacher"
                  ? isArabic
                    ? "أدخل معادلة أو نص مسألة للأستاذ (مثال: solve y'' + 4y = 0 with initial conditions)..."
                    : "Enter pedagogical equation or query..."
                  : isArabic
                    ? "أدخل مسألة رياضية أو معادلة علمية (مثال: integrate x^2 * sin(x) dx)..."
                    : "Enter mathematical query or physics formula..."
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-3 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <button
            type="submit"
            disabled={wolframQuery.isFetching || !queryInput.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50 transition shadow-md shadow-orange-600/30"
          >
            {wolframQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            <span>
              {wolframQuery.isFetching
                ? isArabic ? "جارٍ الحساب..." : "Computing..."
                : activePortal === "teacher"
                  ? isArabic ? "برهان وتوليد الحل" : "Derive & Solve"
                  : isArabic ? "احسب بالخطوات" : "Solve"}
            </span>
          </button>
        </form>

        {/* Quick Samples */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
          <span className="font-semibold text-slate-600">
            {activePortal === "teacher" ? (isArabic ? "أمثلة الأستاذ:" : "Teacher templates:") : (isArabic ? "أمثلة سريعة:" : "Examples:")}
          </span>
          {currentQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryInput(item.q);
                setSearchedQuery(item.q);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {wolframQuery.isLoading ? (
        <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span className="mr-3 text-sm text-slate-600">
            {isArabic ? "جارٍ معالجة المسألة عبر محرك Wolfram|Alpha الحسابي..." : "Computing with Wolfram Alpha Engine..."}
          </span>
        </div>
      ) : wolframQuery.data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                {activePortal === "teacher"
                  ? isArabic ? "المخرجات الرمزية المعتمدة للأستاذ" : "Verified Teacher Derivation"
                  : isArabic ? "النتيجة الحسابية المؤكدة" : "Computational Output"}
              </span>
              <span className="text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-200">
                {activePortal === "teacher" ? (isArabic ? "نمط الأستاذ" : "Teacher Mode") : (isArabic ? "نمط الطالب" : "Student Mode")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopySolution(wolframQuery.data.resultText)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-orange-600 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isArabic ? "نسخ النتيجة" : "Copy"}</span>
              </button>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">{wolframQuery.data.query}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-5 text-white font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-orange-500">
            {wolframQuery.data.resultText}
          </div>

          {wolframQuery.data.steps && wolframQuery.data.steps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>
                    {activePortal === "teacher"
                      ? isArabic ? "خطوات الاستنتاج وسلم التنقيط البيداغوجي:" : "Pedagogical Proof & Derivation:"
                      : isArabic ? "خطوات الحل والاستنتاج الرياضي:" : "Step-by-Step Derivation:"}
                  </span>
                </h4>
                {activePortal === "teacher" && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isArabic ? "مطابق للبرنامج الرسمي الجزائري (رياضيات / تقني رياضي)" : "Aligned with curriculum standards"}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {wolframQuery.data.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-800">
                    <span className="rounded-md bg-orange-100 px-2.5 py-1 font-bold text-orange-800 text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <span className="font-mono text-slate-900">{step}</span>
                      {activePortal === "teacher" && (
                        <p className="text-[11px] text-slate-500">
                          {isArabic ? "ملاحظة بيداغوجية: مراعاة مجموعة التعريف وشرط الاستمرارية وقابلية الاشتقاق." : "Pedagogical check: verify domain constraints and continuity conditions."}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
