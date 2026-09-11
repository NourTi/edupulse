import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  RotateCcw,
  Target,
  ArrowUpRight,
  HelpCircle,
  Timer,
  Zap,
} from "lucide-react";
import { ALGERIAN_STREAMS, ALGERIAN_COMPETENCIES, calculateAlgerianBacAverage } from "@shared/algerianCurriculum";
import { EVIDENCE_DATABASE } from "@/lib/evidenceEngine";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  subject: string;
  frontAr: string;
  backAr: string;
  evidenceBasis: string;
  intervalDays: number;
  nextReviewDate: string;
  boxLevel: 1 | 2 | 3 | 4 | 5; // Leitner box system
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    subject: "الرياضيات (3AS علوم تجريبية)",
    frontAr: "ما هو الشرط اللازم والكافي لتكون النقطة A(x0, f(x0)) نقطة انعطاف لمنحنى دالة؟",
    backAr: "أن تنعدم المشتقة الثانية f''(x) عند x0 وتغير إشارتها (أو تنعدم المشتقة الأولى f'(x) دون أن تغير إشارتها).",
    evidenceBasis: "Spaced Retrieval (Dunlosky et al., 2013)",
    intervalDays: 3,
    nextReviewDate: "اليوم",
    boxLevel: 3,
  },
  {
    id: "fc-2",
    subject: "العلوم الفيزيائية",
    frontAr: "في دارة RC أثناء الشحن، ماذا يمثل المماس للمنحنى Uc(t) عند اللحظة t = 0؟",
    backAr: "نقطة تقاطع المماس عند المبدأ مع المستقيم المقارب الأفقي Uc = E تحدد بيانيا قيمة ثابت الزمن τ = R.C.",
    evidenceBasis: "Dual Coding & Retrieval (Sweller / Paivio)",
    intervalDays: 1,
    nextReviewDate: "اليوم",
    boxLevel: 1,
  },
  {
    id: "fc-3",
    subject: "علوم الطبيعة والحياة",
    frontAr: "لماذا لا تؤدي الطفرة الوراثية الصامتة إلى تغير البنية الفراغية للبروتين؟",
    backAr: "بسبب ترادف الشفرات الوراثية؛ حيث ترمز الرامزة الطافرة لنفس الحمض الأميني الأصلي.",
    evidenceBasis: "Active Recall (Karpicke, 2008)",
    intervalDays: 7,
    nextReviewDate: "بعد 4 أيام",
    boxLevel: 4,
  },
];

export function StudentIntelligencePanel({ isArabic }: { isArabic: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState<"graph" | "retrieval" | "socratic" | "bac_calculator">("graph");
  const [flashcards, setFlashcards] = useState<Flashcard[]>(SAMPLE_FLASHCARDS);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Socratic study assistant state
  const [socraticQuery, setSocraticQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string; rationale?: string }>>([
    {
      role: "assistant",
      text: "مرحباً يا بطل! أنا المساعد البيداغوجي لسنة البكالوريا. لن أعطيك الحل الجاهز، بل سأوجهك خطوة بخطوة عبر أسئلة سقراطية تبني فهمك وتثبت المفاهيم. ما هي المسألة التي تود معالجتها اليوم؟",
      rationale: "Socratic Guided Prompting (Sweller & Flavell - ما وراء المعرفة)",
    },
  ]);

  // Bac simulation state
  const [bacStreamId, setBacStreamId] = useState("3as-sci");
  const [bacGrades, setBacGrades] = useState<Record<string, number>>({
    natural_sciences: 15.5,
    physics_chemistry: 14.0,
    mathematics: 13.5,
    arabic: 13.0,
    philosophy: 11.0,
    french: 14.0,
    english: 15.0,
    history_geography: 12.5,
    islamic_sciences: 16.0,
    pe: 18.0,
  });

  const currentBacCalc = calculateAlgerianBacAverage(bacStreamId, bacGrades);
  const currentStream = ALGERIAN_STREAMS.find(s => s.id === bacStreamId) || ALGERIAN_STREAMS[2];

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleCardResult = (remembered: boolean) => {
    toast.success(remembered ? "رائع! تم ترحيل البطاقة إلى الفترة المتباعدة التالية (+3 أيام)." : "سيعاد جدولة البطاقة خلال 24 ساعة لترسيخ الذاكرة.");
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handleSendSocratic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socraticQuery.trim()) return;

    const userText = socraticQuery;
    setSocraticQuery("");
    setChatMessages((prev) => [...prev, { role: "user", text: userText }]);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `سؤال ممتاز حول: "${userText}". قبل أن نقوم بالحساب المباشر، فكّر معي: ما هو القانون الأساسي الذي يربط بين المتغيرين؟ وهل توجد قيمة حدية أو شرط استمرار يجب مراعاته أولاً؟`,
          rationale: "سقالات معرفية متبوعة بتغذية راجعة إجرائية (Scaffolding)",
        },
      ]);
    }, 500);
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header card */}
      <div className="workspace-card p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                فضاء ذكاء التعلم للطالب · مبني على علوم الإدراك
              </span>
              <span className="text-xs text-slate-500">تحضير بكالوريا 2026</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              مخطط الكفاءات ومساعد المراجعة المتباعدة
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              خارطة مسارك الدراسي، تشخيص الفجوات المانعة للتقدم، وجدول المراجعة المتباعدة وفق المنهاج الجزائري.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
              <span className="text-xs text-slate-500 block">المعدل التقديري المتوقع:</span>
              <span className="text-xl font-extrabold text-blue-600">{currentBacCalc.average} / 20</span>
              <span className="text-[11px] text-emerald-600 block font-semibold">ملاحظة: {currentBacCalc.mentionAr}</span>
            </div>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="flex flex-wrap gap-2 border-t border-slate-200 mt-6 pt-4">
          {[
            { id: "graph", label: "خريطة المفاهيم والفجوات", icon: Layers },
            { id: "retrieval", label: "طابور الاسترجاع المتباعد (بطاقات ليتنر)", icon: RotateCcw },
            { id: "socratic", label: "المساعد السقراطي المعرفي", icon: Sparkles },
            { id: "bac_calculator", label: "محاكي معدل البكالوريا بالمعاملات الرسمية", icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: CONCEPT GRAPH & PREREQUISITES */}
      {activeSubTab === "graph" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="workspace-card p-5 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">كفاءات مكتسبة ومثبتة</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">18 كفاءة</p>
              <p className="text-xs text-slate-500 mt-1">تم التحقق منها في الفروض</p>
            </div>
            <div className="workspace-card p-5 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">كفاءات قيد التدريب النشط</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">05 كفاءات</p>
              <p className="text-xs text-slate-500 mt-1">الدوال الأسية واللوغاريتمية</p>
            </div>
            <div className="workspace-card p-5 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">فجوات سابقة تعيق التقدم</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">02 فجوة</p>
              <p className="text-xs text-amber-700 mt-1">تتطلب تدريباً تداركياً</p>
            </div>
            <div className="workspace-card p-5 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">مؤشر الاستبقاء المعرفي</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">87%</p>
              <p className="text-xs text-slate-500 mt-1">معدل استدعاء مستدام</p>
            </div>
          </div>

          {/* Interactive Knowledge Nodes */}
          <div className="workspace-card p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">شجرة الترابط المعرفي للكفاءات (المنهاج الجزائري)</h2>
                <p className="text-xs text-slate-500">توضح الشجرة كيف تعتمد المفاهيم المتقدمة على مكتسباتك القبلية</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  unit: "الرياضيات · الدوال العددية",
                  topic: "الاشتقاقية، جدول التغيرات ونقاط الانعطاف",
                  status: "متمكن (92%)",
                  statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  prereq: "حساب النهايات، معادلات الدرجة الثانية (مكتملة ✓)",
                  blocks: "يفتح لك: دراسة الدوال اللوغاريتمية والأسية",
                },
                {
                  unit: "الرياضيات · المتتاليات العددية",
                  topic: "البرهان بالتراجع وإثبات التقارب",
                  status: "يحتاج تدريب استرجاع (68%)",
                  statusColor: "bg-amber-50 text-amber-800 border-amber-200",
                  prereq: "المتتاليات الهندسية والحسابية (مكتسبة جزئياً)",
                  blocks: "يعيق: حساب نهايات المجاميع المعقدة في البكالوريا",
                },
                {
                  unit: "العلوم الفيزيائية · الظواهر الكهربائية",
                  topic: "المعادلات التفاضلية لثنائي القطب RC و RL",
                  status: "متمكن (85%)",
                  statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  prereq: "قانون جمع التوترات وتفريغ الطاقة",
                  blocks: "يفتح لك: الاهتزازات الكهربائية الحرة RLC",
                },
                {
                  unit: "علوم الطبيعة والحياة · التخصص الوظيفي للبروتينات",
                  topic: "آليات الترجمة والتخصص البنيوي للإنزيمات",
                  status: "مكتسب حديثاً (75%)",
                  statusColor: "bg-blue-50 text-blue-700 border-blue-200",
                  prereq: "بنية الـ ADN واستنساخ الـ ARNm",
                  blocks: "يفتح لك: دور البروتينات في المناعة والدفاع عن الذات",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{item.topic}</h3>
                    <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                      <p><strong>المتطلب السابق:</strong> {item.prereq}</p>
                      <p className="text-blue-700 font-medium"><strong>الأثر على الوحدات القادمة:</strong> {item.blocks}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${item.statusColor}`}>
                      {item.status}
                    </span>
                    <button
                      onClick={() => {
                        setActiveSubTab("retrieval");
                        toast.success(`تم فتح تدريب الاسترجاع الخاص بـ "${item.topic}".`);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1 shadow-xs"
                    >
                      بدء تدريب الاسترجاع <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SPACED RETRIEVAL QUEUE */}
      {activeSubTab === "retrieval" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <div className="max-w-2xl">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                طابور الاسترجاع المتباعد (Spaced Repetition Queue)
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                بطاقات الممارسة الموزعة وفق نظام ليتنر (Leitner System)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                بدلاً من المراجعة العشوائية أو إعادة القراءة السلبية، تظهر لك البطاقات في الموعد الأمثل قبل النسيان مباشرة بناءً على أبحاث Ebbinghaus و Dunlosky.
              </p>
            </div>

            {/* Flashcard interactive viewer */}
            <div className="mt-8 max-w-xl mx-auto">
              <div
                onClick={handleFlip}
                className={`cursor-pointer min-h-[220px] p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isFlipped
                    ? "bg-slate-900 text-white border-slate-800 shadow-lg"
                    : "bg-white text-slate-900 border-slate-300 hover:border-slate-400 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className={`font-bold ${isFlipped ? "text-amber-300" : "text-blue-600"}`}>
                      {flashcards[activeCardIndex].subject}
                    </span>
                    <span className={isFlipped ? "text-slate-400" : "text-slate-500"}>
                      المستوى في صندوق ليتنر: {flashcards[activeCardIndex].boxLevel}/5
                    </span>
                  </div>

                  <p className="text-base font-bold leading-relaxed">
                    {isFlipped ? flashcards[activeCardIndex].backAr : flashcards[activeCardIndex].frontAr}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs mt-6 pt-3 border-t border-slate-200/20">
                  <span className={isFlipped ? "text-slate-400" : "text-slate-400"}>
                    {isFlipped ? "الإجابة النموذجية مع التعليل" : "انقر على البطاقة للكشف عن الإجابة 🔄"}
                  </span>
                  <span className={`font-medium ${isFlipped ? "text-emerald-400" : "text-slate-500"}`}>
                    {flashcards[activeCardIndex].evidenceBasis}
                  </span>
                </div>
              </div>

              {/* Assessment buttons */}
              {isFlipped && (
                <div className="flex gap-3 justify-center mt-4">
                  <button
                    onClick={() => handleCardResult(false)}
                    className="px-5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100"
                  >
                    صعب / لم أستحضر (إعادة غداً)
                  </button>
                  <button
                    onClick={() => handleCardResult(true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                  >
                    تذكرت تماماً ✓ (+3 أيام)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SOCRATIC GUIDED TUTOR */}
      {activeSubTab === "socratic" && (
        <div className="workspace-card p-6 border border-slate-200 space-y-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              المساعد السقراطي المعرفي · تحضير البكالوريا
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              حوار تفاعلي يبني التفكير دون إفساد متعة الحل
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              إذا أعطاك الذكاء الاصطناعي الحل كاملاً، تفقد الذاكرة فرصة التثبيت العصبي. هنا يوجهك المساعد بالسؤال المناسب والخطوة التدرجية.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 h-80 overflow-y-auto space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl max-w-xl text-xs leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-white border border-slate-200 text-slate-800 mr-auto"
                    : "bg-slate-900 text-white ml-auto"
                }`}
              >
                <p className="font-medium">{msg.text}</p>
                {msg.rationale && (
                  <span className="block mt-1.5 text-[10px] text-blue-600 font-semibold border-t border-slate-100 pt-1">
                    💡 الأساس التربوي: {msg.rationale}
                  </span>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendSocratic} className="flex gap-2">
            <input
              type="text"
              value={socraticQuery}
              onChange={(e) => setSocraticQuery(e.target.value)}
              placeholder="اطرح سؤالك أو جزءاً من مسألة تستصعبها في المنهاج الجزائري..."
              className="flex-1 bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 shrink-0"
            >
              إرسال للسقراطي
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: ALGERIAN BAC SIMULATOR */}
      {activeSubTab === "bac_calculator" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  حاسبة معدل البكالوريا الجزائرية الرسمية
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  توقع المعدل وحساب النقاط بالمعاملات الوزارية
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  اختر الشعبة، عدل النقاط المتوقعة في كل مادة لترى فوراً تأثير كل معامل والتقدير الوزاري الرسمي.
                </p>
              </div>

              <div>
                <select
                  value={bacStreamId}
                  onChange={(e) => setBacStreamId(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 font-bold"
                >
                  {ALGERIAN_STREAMS.filter(s => s.cycle === "3AS").map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameAr} ({s.totalCoefficients} معامل)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simulation results banner */}
            <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">النتيجة التقديرية للبكالوريا:</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-extrabold text-white">{currentBacCalc.average} / 20</span>
                  <span className="text-sm font-bold text-emerald-400">التقدير: {currentBacCalc.mentionAr}</span>
                </div>
              </div>
              <div className="text-xs text-slate-300 space-y-0.5">
                <p>مجموع النقاط الموزونة: <strong className="text-white">{currentBacCalc.totalPoints}</strong></p>
                <p>مجموع معاملات الشعبة: <strong className="text-white">{currentBacCalc.totalCoeff}</strong></p>
                <p className="text-emerald-300 font-semibold">{currentBacCalc.passed ? "ناجح ومؤهل للتعليم العالي ✓" : "معدل دون العتبة (أقل من 10)"}</p>
              </div>
            </div>

            {/* Subject Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
              {currentStream.subjects.map((subj) => (
                <div key={subj.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{subj.nameAr}</span>
                    <span className="text-[11px] text-slate-500">المعامل: {subj.coefficient}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.25}
                    value={bacGrades[subj.id] ?? 10}
                    onChange={(e) => setBacGrades({ ...bacGrades, [subj.id]: parseFloat(e.target.value) || 0 })}
                    className="w-16 bg-white border border-slate-300 text-slate-900 font-bold text-center text-sm rounded-lg p-1.5 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
