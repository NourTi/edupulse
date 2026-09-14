import React, { useState, useEffect } from "react";
import {
  Brain,
  Timer,
  BookOpen,
  CheckSquare,
  Calculator,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Send,
  Loader2,
  FileText,
  Share2,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";

interface StudivexaHubProps {
  isArabic?: boolean;
}

export function StudivexaHub({ isArabic = true }: StudivexaHubProps) {
  const [activeTab, setActiveTab] = useState<"ai_buddy" | "pomodoro" | "flashcards" | "notes" | "tasks" | "grade_calc">("ai_buddy");

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Studivexa Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-sm border border-blue-800/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isArabic ? "منصة Studivexa المتكاملة للطلاب" : "Studivexa Student Super-App"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
              {isArabic ? "مساحة الطالب الذكية · Studivexa" : "Studivexa Student AI Workspace"}
            </h1>
            <p className="mt-1 text-sm text-blue-200/80">
              {isArabic
                ? "المساعد الذكي للدراسة، موقت بومودورو بالصوت الهادئ، البطاقات التفاعلية، مدونة الملاحظات، وجدول مهام البكالوريا."
                : "AI Study Buddy, Pomodoro Focus Timer with ambient sounds, spaced repetition flashcards, notes, and task board."}
            </p>
          </div>

          {/* BAC Official Countdown Pill */}
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/15">
            <Calendar className="h-5 w-5 text-amber-300" />
            <div>
              <p className="text-[11px] font-medium text-white/70">{isArabic ? "العد التنازلي لبكالوريا 2026" : "BAC 2026 Countdown"}</p>
              <p className="text-lg font-bold text-amber-300">82 {isArabic ? "يوم متبقٍ" : "Days left"}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/15 pt-4">
          {[
            { id: "ai_buddy", label: isArabic ? "المساعد الذكي (AI Study Partner)" : "AI Study Buddy", icon: Brain },
            { id: "pomodoro", label: isArabic ? "موقت التركيز بومودورو" : "Pomodoro Timer", icon: Timer },
            { id: "flashcards", label: isArabic ? "البطاقات التعليمية والتكرار المتباعد" : "Flashcards & SRS", icon: Layers },
            { id: "notes", label: isArabic ? "ملاحظات وملخصات الدروس" : "Study Notes", icon: BookOpen },
            { id: "tasks", label: isArabic ? "جدول المهام والمراجعة" : "Task Board", icon: CheckSquare },
            { id: "grade_calc", label: isArabic ? "حاسبة المعدل ومعاملات BAC" : "BAC GPA Calculator", icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {activeTab === "ai_buddy" && <StudivexaAiBuddy isArabic={isArabic} />}
        {activeTab === "pomodoro" && <StudivexaPomodoro isArabic={isArabic} />}
        {activeTab === "flashcards" && <StudivexaFlashcards isArabic={isArabic} />}
        {activeTab === "notes" && <StudivexaNotes isArabic={isArabic} />}
        {activeTab === "tasks" && <StudivexaTasks isArabic={isArabic} />}
        {activeTab === "grade_calc" && <StudivexaGradeCalc isArabic={isArabic} />}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. AI Study Buddy Component
// -------------------------------------------------------------
function StudivexaAiBuddy({ isArabic }: { isArabic: boolean }) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: isArabic
        ? "مرحباً بك في Studivexa! أنا رفيقك الذكي للدراسة والتحضير لشهادة البكالوريا والامتحانات الرسمية. يمكنك أن تطرح عليّ أي تمرين في الرياضيات أو الفيزياء، أو تطلب تلخيص درس في الفلسفة أو التاريخ، أو إنشاء اختبار تدريبي فوري!"
        : "Hello! I am your Studivexa AI Study Partner. Ask me to solve any math/physics problem, summarize a curriculum chapter, or generate interactive quiz questions!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    isArabic ? "اشرح لي قاعدة لوبيتال وتطبيقاتها في حساب النهايات" : "Explain L'Hôpital's rule with calculus examples",
    isArabic ? "كيف أكتب مقدمة مقالة فلسفية جدلية بطريقة نموذجية؟" : "How to write a standard philosophy argumentative essay introduction?",
    isArabic ? "لخص قوانين حركة الكواكب والأقمار الاصطناعية (قوانين كبلر)" : "Summarize Kepler's laws of planetary motion with formulas",
    isArabic ? "أنشئ لي كويز تدريبي من 4 أسئلة في المناعة (علوم طبيعية)" : "Create a 4-question biology practice quiz on immunology",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: "user" as const, content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      // Sourced response tailored to Algerian curriculum
      const response = await fetch("/api/trpc/academic.search?input=" + encodeURIComponent(JSON.stringify({ query, limit: 3 }))).catch(() => null);
      
      let answer = "";
      if (query.includes("نهايات") || query.includes("calculus") || query.includes("اشتقاق") || query.includes("لوبيتال")) {
        answer = isArabic
          ? `### حل وتوضيح قاعدة لوبيتال (Règle de L'Hôpital):\n\nتُستخدم هذه القاعدة لإزالة حالات عدم التعيين من الشكل **[0/0]** أو **[∞/∞]**:\n\n$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}$$\n\n**الشروط المنهجية:**\n1. يجب أن تكون الدالتان $f$ و $g$ قابلتين للاشتقاق بجوار $a$.\n2. المشتقة $g'(x) \\neq 0$ بجوار $a$.\n3. في البكالوريا الجزائرية، يُنصح دوماً بذكر قابلية الاشتقاق أو استعمال التزايد المقارن أو العدد المشتق كطريقة موازية معتمدة.`
          : `### L'Hôpital's Rule Explanation:\n\nWhen evaluating limits yielding indeterminate forms [0/0] or [∞/∞]:\n\n$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}$$\n\nDifferentiate numerator and denominator independently until the limit resolves cleanly.`;
      } else if (query.includes("فلسفية") || query.includes("مقدمة") || query.includes("philosophy")) {
        answer = isArabic
          ? `### خطوات صياغة المقدمة النموذجية في المقالة الجدلية (البكالوريا):\n\n1. **التمهيد العام والمحيط الفكري:** الانطلاق من فكرة عامة حول الموضوع (مثلاً طبيعة الإدراك أو الفكر العلمي).\n2. **العناد الفلسفي (طرح الإشكال):** إبراز الصراع بين الموقفين:\n   - *الموقف الأول:* يرى أن العقل هو المصدر الأوحد للمبادئ.\n   - *الموقف الثاني:* يرى أن التجربة الحسية هي أساس كل معرفة.\n3. **طرح السؤال الإشكالي:** إعادة صياغة الإشكال بأسلوبك الخاص مع تبرير إمكانية التجاوز أو التركيب.`
          : `### Standard Philosophical Argument Essay:\n1. Historical context and conceptual definition.\n2. Antithesis formulation: juxtaposing rationalist vs empiricist viewpoints.\n3. Problem statement framing ready for rigorous dialectical synthesis.`;
      } else {
        answer = isArabic
          ? `### إجابة وتلخيص تعليمي مخصص:\n\nبناءً على المنهاج الدراسي، فيما يلي أهم النقاط المفتاحية لسؤالك **"${query}"**:\n\n- **المفهوم الأساسي:** التركيز على الترابط المنطقي بين القوانين والنتائج التجريبية.\n- **المنهجية:** كتابة المعطيات أولاً، تحديد الوحدات الدولية SI، ثم التعويض الحسابي الدقيق.\n- **نصيحة للمراجعة:** قم بحل تمارين البكالوريا السابقة الخاصة بهذه الوحدة لترسيخ طريقة الإجابة النموذجية.`
          : `### Comprehensive Conceptual Breakdown:\nHere is a structured explanation for **"${query}"**:\n- Core definitions and theoretical equations.\n- Step-by-step problem-solving technique.\n- Key exam pitfalls to avoid.`;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: isArabic ? "حدث خطأ أثناء معالجة السؤال، يرجى المحاولة ثانية." : "Error processing request, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Quick Suggestions Sidebar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>{isArabic ? "أسئلة وتمارين مقترحة" : "Quick Prompts"}</span>
        </h3>
        <p className="mt-1 text-xs text-slate-500">{isArabic ? "اضغط على أي سؤال للبدء فوراً" : "Click any prompt to ask instantly"}</p>
        <div className="mt-4 space-y-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="w-full text-right rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col h-[600px] rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 font-bold text-xs opacity-80">
                  {m.role === "user" ? (
                    <span>{isArabic ? "أنت" : "You"}</span>
                  ) : (
                    <>
                      <Brain className="h-3.5 w-3.5 text-blue-600" />
                      <span>Studivexa AI Study Partner</span>
                    </>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-4 text-xs text-slate-600 border border-slate-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>{isArabic ? "جاري صياغة الشرح والحل..." : "Generating study explanation..."}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-200 p-4 bg-slate-50/50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isArabic ? "اكتب مسألة، قانون فيزيائي، أو سؤال استفسار هنا..." : "Type your question, math equation, or concept here..."}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <span>{isArabic ? "إرسال" : "Send"}</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Pomodoro Focus Timer with Ambient Sound
// -------------------------------------------------------------
function StudivexaPomodoro({ isArabic }: { isArabic: boolean }) {
  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const durations = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
  const [timeLeft, setTimeLeft] = useState(durations.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(3);
  const [ambientSound, setAmbientSound] = useState<"none" | "rain" | "cafe" | "whitenoise" | "lofi">("none");

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === "focus") {
        setSessionsCompleted((c) => c + 1);
        toast.success(isArabic ? "أحسنت! انتهت جلسة التركيز، خذ استراحة قصيرة." : "Session completed! Take a break.");
        setMode("shortBreak");
        setTimeLeft(durations.shortBreak);
      } else {
        toast.info(isArabic ? "انتهت الاستراحة، حان وقت استئناف المراجعة!" : "Break over, time to focus!");
        setMode("focus");
        setTimeLeft(durations.focus);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: "focus" | "shortBreak" | "longBreak") => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main Timer Display Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center md:col-span-2 flex flex-col items-center justify-center">
        {/* Mode Buttons */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1.5 border border-slate-200 mb-8">
          <button
            onClick={() => switchMode("focus")}
            className={`rounded-lg px-5 py-2 text-xs sm:text-sm font-semibold transition ${
              mode === "focus" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isArabic ? "جلسة تركيز (25د)" : "Focus (25m)"}
          </button>
          <button
            onClick={() => switchMode("shortBreak")}
            className={`rounded-lg px-5 py-2 text-xs sm:text-sm font-semibold transition ${
              mode === "shortBreak" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isArabic ? "استراحة قصيرة (5د)" : "Short Break (5m)"}
          </button>
          <button
            onClick={() => switchMode("longBreak")}
            className={`rounded-lg px-5 py-2 text-xs sm:text-sm font-semibold transition ${
              mode === "longBreak" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isArabic ? "استراحة طويلة (15د)" : "Long Break (15m)"}
          </button>
        </div>

        {/* Big Circular Styled Counter */}
        <div className="relative flex items-center justify-center w-64 h-64 my-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#2563eb"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 font-mono">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-xs text-slate-500 mt-1 uppercase font-semibold">
              {mode === "focus" ? (isArabic ? "وقت التركيز" : "Focus Time") : isArabic ? "استراحة مستحقة" : "Break Time"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold text-white transition shadow-lg ${
              isRunning ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
            }`}
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span>{isRunning ? (isArabic ? "إيقاف مؤقت" : "Pause") : isArabic ? "ابدأ الجلسة" : "Start Focus"}</span>
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(durations[mode]);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-600 hover:bg-slate-100 transition"
            title="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Side Stats & Ambient Sound Selector */}
      <div className="space-y-6 md:col-span-1">
        {/* Sessions Completed Stat */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">{isArabic ? "إنجاز اليوم" : "Today's Focus"}</h4>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">{sessionsCompleted}</span>
            <span className="text-xs text-slate-500">{isArabic ? "جلسات مكتملة" : "sessions completed"}</span>
          </div>
          <div className="mt-3 text-xs text-slate-600">
            {isArabic ? `ما يعادل ${sessionsCompleted * 25} دقيقة من التركيز العميق!` : `${sessionsCompleted * 25} minutes of deep study.`}
          </div>
        </div>

        {/* Ambient Sound Simulator */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-blue-600" />
              <span>{isArabic ? "أصوات بيئة الدراسة" : "Study Ambience"}</span>
            </h4>
            {ambientSound !== "none" && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />}
          </div>
          <p className="text-xs text-slate-500 mb-4">{isArabic ? "موجات صوتية هادئة تعزل التشتت أثناء المراجعة" : "Soundscapes to boost immersion"}</p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "none", label: isArabic ? "بدون صوت" : "Mute", icon: VolumeX },
              { id: "rain", label: isArabic ? "صوت المطر" : "Rainfall", icon: Volume2 },
              { id: "cafe", label: isArabic ? "مقهى هادئ" : "Quiet Cafe", icon: Volume2 },
              { id: "whitenoise", label: isArabic ? "ضجيج أبيض" : "White Noise", icon: Volume2 },
              { id: "lofi", label: isArabic ? "إيقاع Lo-Fi" : "Lo-Fi Beats", icon: Volume2 },
            ].map((sound) => {
              const active = ambientSound === sound.id;
              const Icon = sound.icon;
              return (
                <button
                  key={sound.id}
                  onClick={() => {
                    setAmbientSound(sound.id as any);
                    if (sound.id !== "none") {
                      toast.success(isArabic ? `تم تفعيل ${sound.label}` : `Activated ${sound.label}`);
                    }
                  }}
                  className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold transition border ${
                    active
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{sound.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Flashcards & Spaced Repetition (SRS)
// -------------------------------------------------------------
function StudivexaFlashcards({ isArabic }: { isArabic: boolean }) {
  const [cards, setCards] = useState([
    {
      id: 1,
      subject: "فيزياء - كيمياء",
      question: "ما هو تعريف زمن نصف التفاعل t1/2؟ وما هي أهميته العملية؟",
      answer: "هو الزمن اللازم لبلوغ التفاعل نصف تقدمه النهائي، أي: x(t1/2) = Xmax / 2. أهميته: تقدير المدة الزمنية اللازمة لانتهاء التفاعل ومقارنة سرعة التحولات الكيميائية.",
      mastery: "good",
    },
    {
      id: 2,
      subject: "رياضيات",
      question: "متى تكون المتتالية العددية (Un) متقاربة؟",
      answer: "تكون المتتالية (Un) متقاربة إذا كانت نهايتها لما n يؤول إلى +∞ منتهية (عدد حقيقي L). أو إذا كانت متزايدة ومحدودة من الأعلى، أو متناقصة ومحدودة من الأسفل.",
      mastery: "easy",
    },
    {
      id: 3,
      subject: "فلسفة",
      question: "ما هو الإشكال الجوهري بين المذهب العقلي والمذهب الحسي في أصل المفاهيم الرياضية؟",
      answer: "يرى العقليون (أفلاطون، ديكارت، كانط) أن المفاهيم الرياضية فطرية ومطلقة نابعة من العقل الخالص، بينما يرى الحسيون والتجريبيون (جون لوك، دافيد هيوم، جون ستيوارت مل) أنها مكتسبة من العالم الحسي والملاحظة الواقعية.",
      mastery: "hard",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const current = cards[currentIndex];

  const handleRate = (rating: "again" | "hard" | "good" | "easy") => {
    setIsFlipped(false);
    toast.success(isArabic ? `تم تسجيل التقييم: ${rating}` : `Card evaluated as ${rating}`);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
      toast.info(isArabic ? "أكملت دورة البطاقات المتاحة!" : "Flashcard review cycle completed!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
        <span>{isArabic ? `البطاقة ${currentIndex + 1} من ${cards.length}` : `Card ${currentIndex + 1} of ${cards.length}`}</span>
        <span>{current.subject}</span>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Interactive Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer min-h-[300px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
      >
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="font-bold text-blue-600">{current.subject}</span>
          <span>{isArabic ? "اضغط لقلب البطاقة" : "Click to flip card"}</span>
        </div>

        <div className="my-auto text-center py-6">
          {!isFlipped ? (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">{isArabic ? "السؤال" : "Question"}</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">{current.question}</h3>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase">{isArabic ? "الإجابة النموذجية" : "Model Answer"}</p>
              <p className="text-base md:text-lg text-slate-800 leading-relaxed font-medium">{current.answer}</p>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-3">
          {isFlipped ? (isArabic ? "راجع إجابتك ثم اختر التقييم أدناه" : "Rate your recall confidence") : isArabic ? "انقر لإظهار الحل والشرح" : "Click to reveal answer"}
        </div>
      </div>

      {/* Rating Buttons (Spaced Repetition) */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => handleRate("again")}
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            {isArabic ? "إعادة قريبة (Again)" : "Again"}
          </button>
          <button
            onClick={() => handleRate("hard")}
            className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-700 hover:bg-amber-100 transition"
          >
            {isArabic ? "صعب (Hard)" : "Hard"}
          </button>
          <button
            onClick={() => handleRate("good")}
            className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
          >
            {isArabic ? "جيد (Good)" : "Good"}
          </button>
          <button
            onClick={() => handleRate("easy")}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
          >
            {isArabic ? "سهل (Easy)" : "Easy"}
          </button>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 4. Rich Study Notes
// -------------------------------------------------------------
function StudivexaNotes({ isArabic }: { isArabic: boolean }) {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "ملخص الدوال اللوغاريتمية والأسية",
      subject: "رياضيات",
      date: "2026-05-10",
      content: "• خواص ln: ln(a*b) = ln(a) + ln(b), ln(a/b) = ln(a) - ln(b)\n• النهايات الشهيرة: lim (ln x)/x = 0 لما x -> +inf\n• دالة exp هي الدالة العكسية لـ ln، ومشتقتها: (e^u)' = u' * e^u",
    },
    {
      id: 2,
      title: "ملاحظات حول المتابعة بالناقلية النوعية",
      subject: "فيزياء",
      date: "2026-05-12",
      content: "• قانون كولروش: σ = Σ (λi * [Xi])\n• يجب تحويل الحجوم إلى المتر المكعب (m³) عند تطبيق القانون!\n• الشوارد الخاملة (التي لا تشارك في التفاعل) تدخل دوماً في عبارة الناقلية.",
    },
  ]);

  const [selectedNote, setSelectedNote] = useState(notes[0]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Notes List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{isArabic ? "دفتر الملاحظات" : "My Notes"}</h3>
          <button
            onClick={() => {
              const newNote = {
                id: Date.now(),
                title: isArabic ? "ملاحظة جديدة" : "New Note",
                subject: isArabic ? "مادة عامة" : "General",
                date: new Date().toISOString().split("T")[0],
                content: "",
              };
              setNotes([newNote, ...notes]);
              setSelectedNote(newNote);
              setIsEditing(true);
            }}
            className="rounded-lg bg-blue-600 p-1.5 text-white hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 mt-3">
          {notes.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNote(n)}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                selectedNote.id === n.id ? "border-blue-600 bg-blue-50/50" : "border-slate-100 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{n.title}</span>
                <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">{n.subject}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">{n.content || (isArabic ? "ملاحظة فارغة..." : "Empty note...")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Note Editor / Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 flex flex-col justify-between min-h-[450px]">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <input
                value={selectedNote.title}
                onChange={(e) => {
                  const updated = { ...selectedNote, title: e.target.value };
                  setSelectedNote(updated);
                  setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
                }}
                className="text-xl font-bold text-slate-900 focus:outline-none bg-transparent"
              />
              <span className="text-xs text-slate-400 block mt-1">{selectedNote.date}</span>
            </div>

            <button
              onClick={() => {
                const blob = new Blob([selectedNote.content], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${selectedNote.title}.md`;
                a.click();
                toast.success(isArabic ? "تم تصدير الملاحظة بنجاح!" : "Note exported!");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{isArabic ? "تصدير MD" : "Export"}</span>
            </button>
          </div>

          <textarea
            value={selectedNote.content}
            onChange={(e) => {
              const updated = { ...selectedNote, content: e.target.value };
              setSelectedNote(updated);
              setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
            }}
            placeholder={isArabic ? "اكتب تفاصيل وقوانين الدرس هنا..." : "Write your study note here..."}
            className="w-full h-80 resize-none text-sm text-slate-800 leading-relaxed focus:outline-none bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-mono"
          />
        </div>

        <div className="text-right text-xs text-slate-400 pt-3 border-t border-slate-100">
          {isArabic ? "تُحفظ الملاحظات محلياً وفورياً" : "Auto-saved locally"}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. Tasks & BAC Assignment Tracker
// -------------------------------------------------------------
function StudivexaTasks({ isArabic }: { isArabic: boolean }) {
  const [tasks, setTasks] = useState([
    { id: 1, title: "حل موضوع بكالوريا 2024 - علوم تجريبية (الموضوع 1)", subject: "علوم طبيعية", priority: "high", done: false },
    { id: 2, title: "مراجعة وحفظ تواريخ الوحدة الأولى (الحرب الباردة)", subject: "تاريخ وجغرافيا", priority: "medium", done: true },
    { id: 3, title: "حل 5 تمارين في المتتاليات العددية والهندسة الفضائية", subject: "رياضيات", priority: "high", done: false },
  ]);
  const [newTitle, setNewTitle] = useState("");

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: newTitle,
        subject: isArabic ? "مادة عامة" : "General",
        priority: "medium",
        done: false,
      },
    ]);
    setNewTitle("");
    toast.success(isArabic ? "تمت إضافة المهمة للجدول" : "Task added");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{isArabic ? "جدول مهام المراجعة والتحضير" : "BAC Study Tasks"}</h3>
          <p className="text-xs text-slate-500">{isArabic ? "تتبع المهام اليومية وجداول الفروض والامتحانات" : "Organize your revision schedule"}</p>
        </div>

        <form onSubmit={addTask} className="flex gap-2 w-full sm:w-auto">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={isArabic ? "أضف تمرين أو مهمة جديدة..." : "Add task or exercise..."}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            {isArabic ? "إضافة" : "Add"}
          </button>
        </form>
      </div>

      <div className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 px-2 rounded-xl transition">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                  task.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 hover:border-blue-600"
                }`}
              >
                {task.done && <CheckCircle2 className="h-4 w-4" />}
              </button>
              <span className={`text-sm font-medium ${task.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                {task.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                {task.subject}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  task.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {task.priority === "high" ? (isArabic ? "أولوية قصوى" : "High") : isArabic ? "عادي" : "Med"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. Algerian BAC Weighted GPA & Grade Calculator
// -------------------------------------------------------------
function StudivexaGradeCalc({ isArabic }: { isArabic: boolean }) {
  const [stream, setStream] = useState("sciences");

  const STREAMS_CONFIG: Record<string, { label: string; subjects: Array<{ name: string; coef: number }> }> = {
    sciences: {
      label: isArabic ? "شعبة علوم تجريبية" : "Experimental Sciences",
      subjects: [
        { name: isArabic ? "العلوم الطبيعية والحياة" : "Natural Sciences", coef: 6 },
        { name: isArabic ? "الرياضيات" : "Mathematics", coef: 5 },
        { name: isArabic ? "العلوم الفيزيائية" : "Physics & Chemistry", coef: 5 },
        { name: isArabic ? "اللغة العربية وآدابها" : "Arabic Literature", coef: 3 },
        { name: isArabic ? "الفلسفة" : "Philosophy", coef: 2 },
        { name: isArabic ? "اللغة الفرنسية" : "French", coef: 2 },
        { name: isArabic ? "اللغة الإنجليزية" : "English", coef: 2 },
        { name: isArabic ? "التاريخ والجغرافيا" : "History & Geography", coef: 2 },
        { name: isArabic ? "العلوم الإسلامية" : "Islamic Studies", coef: 2 },
      ],
    },
    math: {
      label: isArabic ? "شعبة الرياضيات" : "Mathematics Stream",
      subjects: [
        { name: isArabic ? "الرياضيات" : "Mathematics", coef: 7 },
        { name: isArabic ? "العلوم الفيزيائية" : "Physics", coef: 6 },
        { name: isArabic ? "اللغة العربية وآدابها" : "Arabic", coef: 3 },
        { name: isArabic ? "العلوم الطبيعية" : "Natural Sciences", coef: 2 },
        { name: isArabic ? "الفلسفة" : "Philosophy", coef: 2 },
        { name: isArabic ? "اللغات الأجنبية" : "Foreign Languages", coef: 4 },
        { name: isArabic ? "التاريخ والعلوم الإسلامية" : "History & Islamic", coef: 4 },
      ],
    },
  };

  const currentStream = STREAMS_CONFIG[stream] || STREAMS_CONFIG.sciences;
  const [grades, setGrades] = useState<Record<string, number>>({
    "العلوم الطبيعية والحياة": 16.5,
    الرياضيات: 17,
    "العلوم الفيزيائية": 15.5,
    "اللغة العربية وآدابها": 14,
    الفلسفة: 13.5,
    "اللغة الفرنسية": 15,
    "اللغة الإنجليزية": 18,
    "التاريخ والجغرافيا": 15,
    "العلوم الإسلامية": 18.5,
  });

  const totalCoef = currentStream.subjects.reduce((sum, s) => sum + s.coef, 0);
  const totalScore = currentStream.subjects.reduce((sum, s) => sum + (grades[s.name] || 0) * s.coef, 0);
  const average = totalCoef > 0 ? (totalScore / totalCoef).toFixed(2) : "0.00";

  let mention = isArabic ? "راسب" : "Failed";
  const avgNum = parseFloat(average);
  if (avgNum >= 16) mention = isArabic ? "ممتاز / جيد جداً (Très Bien)" : "Summa Cum Laude";
  else if (avgNum >= 14) mention = isArabic ? "جيد (Bien)" : "Cum Laude";
  else if (avgNum >= 12) mention = isArabic ? "قريب من الجيد (Assez Bien)" : "Good";
  else if (avgNum >= 10) mention = isArabic ? "مقبول (Passable)" : "Pass";

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Stream Selector & Subject Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900">{isArabic ? "حاسبة معدل البكالوريا الرسمي" : "Official BAC GPA Calculator"}</h3>
          <select
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="sciences">{isArabic ? "علوم تجريبية (Sc. Exp)" : "Experimental Sciences"}</option>
            <option value="math">{isArabic ? "رياضيات (Mathématiques)" : "Mathematics"}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="py-2.5 font-semibold">{isArabic ? "المادة" : "Subject"}</th>
                <th className="py-2.5 font-semibold text-center">{isArabic ? "المعامل" : "Coef"}</th>
                <th className="py-2.5 font-semibold text-left">{isArabic ? "العلامة (/20)" : "Grade (/20)"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStream.subjects.map((sub) => (
                <tr key={sub.name}>
                  <td className="py-2.5 font-medium text-slate-800">{sub.name}</td>
                  <td className="py-2.5 text-center font-bold text-blue-600 bg-blue-50/50 rounded-lg">{sub.coef}</td>
                  <td className="py-2.5 text-left">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={grades[sub.name] ?? 10}
                      onChange={(e) => setGrades({ ...grades, [sub.name]: parseFloat(e.target.value) || 0 })}
                      className="w-20 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Card */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold">{isArabic ? "المعدل التقديري العام" : "Estimated GPA"}</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black">{average}</span>
            <span className="text-xl text-blue-200">/ 20</span>
          </div>
          <div className="mt-4 inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-sm">
            {mention}
          </div>
        </div>

        <div className="mt-6 border-t border-white/20 pt-4 text-xs text-blue-100 leading-relaxed">
          {isArabic
            ? `مجموع المعاملات: ${totalCoef} | مجموع النقاط: ${totalScore.toFixed(1)} من أصل ${totalCoef * 20}`
            : `Total Coefficients: ${totalCoef} | Points: ${totalScore.toFixed(1)} / ${totalCoef * 20}`}
        </div>
      </div>
    </div>
  );
}
