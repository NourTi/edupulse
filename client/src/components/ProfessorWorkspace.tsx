import React, { useState } from "react";
import {
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Plus,
  Tag,
  Share2,
  HelpCircle,
  TrendingUp,
  Brain,
  Filter,
  Check,
  Edit3,
  Bookmark,
  Send,
  MessageSquare,
  BarChart2,
  Lightbulb,
} from "lucide-react";
import { ALGERIAN_STREAMS, ALGERIAN_COMPETENCIES, type AlgerianStream } from "@shared/algerianCurriculum";
import { EVIDENCE_DATABASE, generateEvidenceExplanation } from "@/lib/evidenceEngine";
import { toast } from "sonner";

interface TeacherNote {
  id: string;
  targetType: "student" | "competency" | "group" | "session";
  targetTitle: string;
  author: string;
  date: string;
  tag: "misconception" | "progress" | "pedagogy" | "followup";
  privacy: "private" | "institution_shared";
  content: string;
  hasReminder: boolean;
}

const INITIAL_NOTES: TeacherNote[] = [
  {
    id: "note-1",
    targetType: "student",
    targetTitle: "سارة عبد الرحمن (3AS علوم تجريبية)",
    author: "أستاذ الرياضيات",
    date: "اليوم 08:30",
    tag: "misconception",
    privacy: "private",
    content: "لاحظت تعثرها في اشتقاق الدوال المركبة وتطبيق قاعدة السلسلة. تحتاج إلى مثالين محلولين وتمرين استرجاع متباعد غداً.",
    hasReminder: true,
  },
  {
    id: "note-2",
    targetType: "competency",
    targetTitle: "البرهان بالتراجع والمتتاليات",
    author: "أستاذ الرياضيات",
    date: "أمس 14:15",
    tag: "pedagogy",
    privacy: "institution_shared",
    content: "ثلث الفوج يقفز عن مرحلة التحقق من الرتبة الأولى n=0. سنقوم بتمرين إحماء من 5 دقائق على اللوح الأبيض في مستهل الحصة.",
    hasReminder: false,
  },
];

export function ProfessorWorkspace({ isArabic, onNavigate }: { isArabic: boolean; onNavigate?: (view: string) => void }) {
  const [activeTab, setActiveTab] = useState<"command" | "planner" | "groups" | "notes" | "evidence">("command");
  const [selectedStreamId, setSelectedStreamId] = useState<string>("3as-sci");
  const [notes, setNotes] = useState<TeacherNote[]>(INITIAL_NOTES);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTag, setNewNoteTag] = useState<TeacherNote["tag"]>("pedagogy");
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<any>(null);

  // Planner state
  const [plannerTopic, setPlannerTopic] = useState("دراسة تغيرات دالة لوغاريتمية وحساب النهايات ومستقيم المقارب");
  const [plannerDuration, setPlannerDuration] = useState(60);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [sessionPlan, setSessionPlan] = useState<any>({
    topic: "دراسة تغيرات دالة لوغاريتمية وحساب النهايات ومستقيم المقارب",
    streamName: "3AS علوم تجريبية",
    duration: 60,
    objectives: [
      "حساب نهاية دالة مركبة تتضمن ln(x) عند الصفر بقيم كبرى وعند ما لا نهاية.",
      "تطبيق إشارة المشتقة f'(x) وتعيين جدول التغيرات بدقة.",
      "كتابة معادلة المماس عند نقطة الانعطاف وتفسيرها بيانياً.",
    ],
    stages: [
      {
        step: 1,
        titleAr: "إحماء الاسترجاع النشط (Retrieval Warm-Up)",
        durationMinutes: 5,
        evidenceMethod: "Retrieval Practice (Roediger & Karpicke, 2006)",
        contentAr: "عرض تذكير على السبورة: 3 نهايات شهيرة للدالة اللوغاريتمية دون استعانة بالدفتر (كتابة فردية على الألواح ثم تصحيح جماعي).",
        checkpoint: "التحقق من عدم خلط lim (ln x)/x مع lim x.ln x عند 0.",
      },
      {
        step: 2,
        titleAr: "الشرح المركز والنمذجة الصريحة (Explicit Modeling)",
        durationMinutes: 12,
        evidenceMethod: "Cognitive Load & Worked Examples (Sweller, 1988)",
        contentAr: "شرح طريقة إزالة حالة عدم التعيين (ح.ع.ت) بواسطة العامل المشترك وتطبيق التزايد المقارن بصوت مسموع (Think-Aloud).",
        checkpoint: "سؤال تشخيصي فوري للتأكد من فهم سبب اختيار إخراج x كعامل مشترك.",
      },
      {
        step: 3,
        titleAr: "مثال محلول مع التلاشي (Faded Worked Example)",
        durationMinutes: 13,
        evidenceMethod: "Fading Scaffolding (Paas & van Merriënboer)",
        contentAr: "المسألة الأولى محلولة ومبررة بالكامل. المسألة الثانية يكمل الطلاب الخطوة الأخيرة (استنتاج إشارة المشتقة).",
        checkpoint: "تنبيه لملاحظة إشارة المقام (هل المقام مربع موجب دائماً؟).",
      },
      {
        step: 4,
        titleAr: "نشاط تعاوني في أفواج مصغرة (Peer Collaboration)",
        durationMinutes: 18,
        evidenceMethod: "Collaborative Learning & Metacognitive Prompts",
        contentAr: "توزيع الطلاب في أفواج متجانسة الكفاءة لمعالجة تمرين بكالوريا جزائرية سابق (دورة جوان 2022).",
        checkpoint: "المعلم يتنقل بين الأفواج لتسجيل الملاحظات النوعية ومساعدة المتعثرين فقط.",
      },
      {
        step: 5,
        titleAr: "تذكرة الخروج التكوينية (Formative Exit Ticket)",
        durationMinutes: 7,
        evidenceMethod: "Formative Assessment (Black & Wiliam, 1998)",
        contentAr: "سؤال خروج فردي من دقيقتين: احسب مشتقة g(x) = ln(2x+1)/(x+1) وسلم الورقة قبل مغادرة القاعة.",
        checkpoint: "تصنيف الإجابات إلى 3 مستويات لتحديد خطة التدخل في الحصة المقبلة.",
      },
      {
        step: 6,
        titleAr: "التكليف المنزلي المتباعد (Spaced Follow-Up)",
        durationMinutes: 5,
        evidenceMethod: "Spaced Practice (Cepeda et al., 2006)",
        contentAr: "تمرينان متباعدان: الأول حول لوغاريتم اليوم، والثاني حول المتتاليات من الأسبوع الماضي للحفاظ على المسار العصبي نشطاً.",
        checkpoint: "المراجعة التلقائية في منصة EduPulse خلال 48 ساعة.",
      },
    ],
  });

  // Groups state
  const [groupsGoal, setGroupsGoal] = useState<"peer_tutoring" | "complementary" | "exam_sprint">("peer_tutoring");
  const [smartGroups, setSmartGroups] = useState([
    {
      id: "g1",
      nameAr: "فوج المتتاليات ودراسة الدوال (مجموعة الإسناد)",
      goalLabel: "تعليم الأقران (Peer Tutoring)",
      rationaleAr: "تم دمج سارة (قوية في النهايات والبيان) مع إيناس (تحتاج دعماً في المشتقة المركبة). الأدلة تشير إلى أن تعليم الأقران يثبت المفهوم للمشرح ويرفع ثقة المتعثر.",
      members: [
        { name: "سارة عبد الرحمن", role: "موجه أقران (Mastery: 88%)", strength: "حساب المشتقات وتفسير المماس" },
        { name: "إيناس بلقاسم", role: "مستفيد من الشرح (Mastery: 54%)", strength: "الاستيعاب المفاهيمي، تحتاج تدرج حسابي" },
        { name: "أحمد بن عيسى", role: "مشارك مساهم (Mastery: 72%)", strength: "جبريات وحساب جذور" },
      ],
    },
    {
      id: "g2",
      nameAr: "فوج التعمق والمستويات العليا (Advanced Sprint)",
      goalLabel: "حل المسائل التركيبية الشاملة",
      rationaleAr: "مجموعة متجانسة ذات كفاءة عالية لمعالجة مسائل البكالوريا التجريبية ذات الخطوات المتعددة دون إبطاء وتيرة بقية القسم.",
      members: [
        { name: "ياسين قادري", role: "متقدم (Mastery: 95%)", strength: "البرهان بالخلف واستنتاج حصر الحلول" },
        { name: "مريم دحماني", role: "متقدمة (Mastery: 91%)", strength: "توظيف مبرهنة القيم المتوسطة والتبيين الدقيق" },
      ],
    },
  ]);

  const currentStream = ALGERIAN_STREAMS.find(s => s.id === selectedStreamId) || ALGERIAN_STREAMS[2];

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const newNote: TeacherNote = {
      id: `note-${Date.now()}`,
      targetType: "student",
      targetTitle: `${currentStream.nameAr} - ملاحظة بيداغوجية`,
      author: "أستاذ المادة",
      date: "الآن",
      tag: newNoteTag,
      privacy: "private",
      content: newNoteContent,
      hasReminder: true,
    };
    setNotes([newNote, ...notes]);
    setNewNoteContent("");
    toast.success("تم حفظ الملاحظة التربوية وربطها بسجل المتابعة.");
  };

  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setIsGeneratingPlan(false);
      toast.success("تم إنشاء خطة الحصة المعتمدة على علوم الإدراك والمنهاج الجزائري.");
    }, 600);
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Banner with Stream Selector & Tab Navigation */}
      <div className="workspace-card p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                غرفة قرار الأستاذ · النظام الجزائري
              </span>
              <span className="text-xs text-slate-500">العام الدراسي 2025/2026</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              مركز القيادة البيداغوجية وقرارات التدريس
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              أدوات قائمة على الأدلة المعرفية لإدارة القسم، تخطيط الحصص، وتشكيل الأفواج، ومتابعة الكفاءات دون أحكام تعسفية.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">الفوج / الشعبة:</label>
            <select
              value={selectedStreamId}
              onChange={(e) => setSelectedStreamId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-medium"
            >
              {ALGERIAN_STREAMS.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.cycle} · {stream.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-t border-slate-200 mt-6 pt-4">
          {[
            { id: "command", label: "نظرة القرار والتتبع", icon: BarChart2 },
            { id: "planner", label: "مخطط الحصة التفاعلي (6 خطوات)", icon: Calendar },
            { id: "groups", label: "باني الأفواج البيداغوجية", icon: Users },
            { id: "notes", label: "الملاحظات المرتبطة بالسياق", icon: FileText },
            { id: "evidence", label: "مكتبة الأدلة والعلوم الإدراكية", icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

      {/* TAB 1: COMMAND & CLASS OVERVIEW */}
      {activeTab === "command" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="workspace-card p-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">التلاميذ المسجلون بالفوج</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">32 تلميذاً</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <span>●</span> نسبة الحضور اليوم: 94%
              </p>
            </div>

            <div className="workspace-card p-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">كفاءات قيد التدريب</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">04 وحدات</p>
              <p className="text-xs text-slate-500 mt-1">المنهاج الجزائري للثلاثي الأول</p>
            </div>

            <div className="workspace-card p-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">حالات تحتاج تدخل فوري</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-2">03 طلاب</p>
              <p className="text-xs text-amber-700 mt-1">فجوة في المتطلبات السابقة (الاشتقاق)</p>
            </div>

            <div className="workspace-card p-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">التدريب المتباعد النشط</span>
                <Clock className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-teal-700 mt-2">دورة الأسبوع 3</p>
              <p className="text-xs text-slate-500 mt-1">استرجاع تراكمي لنهايات الدوال</p>
            </div>
          </div>

          {/* Core Decision Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Students Priority & Competency Mastery */}
            <div className="lg:col-span-2 space-y-6">
              {/* Students Needing Pedagogical Attention */}
              <div className="workspace-card p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">أولويات التدخل البيداغوجي اليوم</h2>
                    <p className="text-xs text-slate-500">توصيات واضحة ومبررة بالأدلة لمساعدة التلاميذ دون وصم</p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                    مطلوب مراجعة المعلم
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "سارة عبد الرحمن",
                      competency: "الدوال: الاشتقاقية وقاعدة السلسلة",
                      status: "فجوة في مشتقة f(u(x))",
                      recommendation: "أمثلة محلولة مع التلاشي (Worked Examples with Fading)",
                      citation: "Sweller (1988) - تقليل الحمل المعرفي",
                      action: "تمرين تمايز 5 دقائق",
                      color: "border-amber-200 bg-amber-50/40",
                    },
                    {
                      name: "حمزة بلعيد",
                      competency: "المتتاليات: البرهان بالتراجع",
                      status: "تخطي شرط الابتداء n=0",
                      recommendation: "تمرين استرجاع نشط فوري على اللوح (Retrieval)",
                      citation: "Roediger & Karpicke (2006)",
                      action: "توجيه سؤال استهلالي في بداية الحصة",
                      color: "border-blue-200 bg-blue-50/40",
                    },
                    {
                      name: "نادية بن عامر",
                      competency: "الفيزياء: قراءة مخطط RC وثابت الزمن τ",
                      status: "خلط بين المماس عند 0 وقيمة 0.63E",
                      recommendation: "الترميز المزدوج البياني والجبري (Dual Coding)",
                      citation: "Paivio (1986); Mayer (2009)",
                      action: "إرفاق بطاقة مقارنة بصرية",
                      color: "border-teal-200 bg-teal-50/40",
                    },
                  ].map((st, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${st.color} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                          <span className="text-xs text-slate-500">· {st.competency}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1">
                          <strong>التشخيص:</strong> {st.status}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          <strong>التدخل المقترح:</strong> {st.recommendation}{" "}
                          <span className="text-slate-400">({st.citation})</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          toast.success(`تمت إضافة إجراء "${st.action}" لخطة الحصة الخاصة بـ ${st.name}`);
                        }}
                        className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 shrink-0 shadow-xs"
                      >
                        اعتماد الإجراء ✓
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competency Mastery Map for Stream */}
              <div className="workspace-card p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">خريطة تمكن الفوج من كفاءات البرنامج الوطني</h2>
                    <p className="text-xs text-slate-500">{currentStream.nameAr} · معاملات المواد: {currentStream.totalCoefficients}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {ALGERIAN_COMPETENCIES.slice(0, 3).map((comp) => (
                    <div key={comp.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {comp.unitAr}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm mt-1">{comp.titleAr}</h3>
                          <p className="text-xs text-slate-500">{comp.titleFr}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                          وزن في البكالوريا: عالي
                        </span>
                      </div>

                      {/* Mastery Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-600">نسبة تمكن القسم التقديرية</span>
                          <span className="text-slate-900">76%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "76%" }}></div>
                        </div>
                      </div>

                      {/* Misconception Alert */}
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                        <span className="font-bold">⚠️ خطأ شائع مرصود بالمنهاج:</span> {comp.commonMisconceptions[0]?.misconceptionAr}
                        <div className="mt-1 text-slate-600">
                          <strong>الحل المقترح:</strong> {comp.commonMisconceptions[0]?.suggestedIntervention}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Subjects, Coefficients & Quick Teaching Priority */}
            <div className="space-y-6">
              {/* Teaching Priority Checklist */}
              <div className="workspace-card p-6 border border-slate-200">
                <h2 className="text-base font-bold text-slate-900 mb-2">أولويات التدريس لحصة اليوم</h2>
                <p className="text-xs text-slate-500 mb-4">خطوات عملية مباشرة قبل دخول القاعة</p>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
                    <span>تمرين استرجاع لـ 5 دقائق حول نهايات الدوال المرجعية</span>
                  </label>
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
                    <span>نمذجة مثال محلول لدراسة إشارة الدالة المشتقة</span>
                  </label>
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input type="checkbox" className="mt-0.5 rounded text-blue-600" />
                    <span>فصل الفوج إلى ثنائيات لحل تمرين بكالوريا 2023</span>
                  </label>
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input type="checkbox" className="mt-0.5 rounded text-blue-600" />
                    <span>جمع بطاقة الخروج التكوينية لتقييم الاستيعاب</span>
                  </label>
                </div>

                <button
                  onClick={() => setActiveTab("planner")}
                  className="w-full mt-4 py-2 px-3 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-1"
                >
                  فتح مخطط الحصة المفصل <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Algerian Stream Subjects & Coefficients Card */}
              <div className="workspace-card p-6 border border-slate-200">
                <h2 className="text-base font-bold text-slate-900 mb-1">{currentStream.nameAr}</h2>
                <p className="text-xs text-slate-500 mb-3">جدول المعاملات وساعات التدريس الأسبوعية الرسمية</p>

                <div className="divide-y divide-slate-100 text-xs">
                  {currentStream.subjects.slice(0, 6).map((sub) => (
                    <div key={sub.id} className="py-2 flex items-center justify-between">
                      <span className="font-medium text-slate-800">{sub.nameAr}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          المعامل {sub.coefficient}
                        </span>
                        <span className="text-slate-400">{sub.weeklyHours} سا/أسبوع</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE SESSION PLANNER */}
      {activeTab === "planner" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <div className="max-w-3xl">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                مخطط الحصص التفاعلي · مبني على علوم الإدراك
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                تخطيط درس ذكي لـ {currentStream.nameAr}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                لا ننتج نصوصاً عشوائية، بل هيكل درس مقسّم إلى 6 مراحل متتالية تراعي طاقة الذاكرة العاملة ونظرية الحمل المعرفي (Sweller) وممارسة الاسترجاع (Roediger).
              </p>
            </div>

            {/* Config Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان الموضوع أو الكفاءة المستهدفة</label>
                <input
                  type="text"
                  value={plannerTopic}
                  onChange={(e) => setPlannerTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5"
                  placeholder="مثال: اشتقاق الدوال المركبة، أو شحن المكثفة وتحديد ثابت الزمن"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المدة الزمنية للحصة</label>
                <select
                  value={plannerDuration}
                  onChange={(e) => setPlannerDuration(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 font-medium"
                >
                  <option value={60}>60 دقيقة (حصة عادية)</option>
                  <option value={90}>90 دقيقة (حصة مدمجة)</option>
                  <option value={120}>120 دقيقة (أعمال موجهة أو مخبرية)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {isGeneratingPlan ? "جاري التوليد المعرفي..." : "إعادة توليد مراحل الحصة"}
              </button>
            </div>
          </div>

          {/* Generated 6-Step Plan Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                مراحل الحصة المقترحة ({sessionPlan.duration} دقيقة) — يمكنك تعديل كل بطاقة بحرية
              </h3>
              <span className="text-xs text-slate-500">المعلم هو صاحب القرار النهائي</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sessionPlan.stages.map((st: any) => (
                <div key={st.step} className="workspace-card p-5 border border-slate-200 transition hover:border-slate-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {st.step}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{st.titleAr}</h4>
                        <span className="text-xs text-blue-600 font-medium">الأساس العلمي: {st.evidenceMethod}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
                      ⏱ {st.durationMinutes} دقائق
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-relaxed">
                    {st.contentAr}
                  </div>

                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">نقطة التحقق المعرفي (Checkpoint):</strong> {st.checkpoint}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => toast.success("تم اعتماد وطباعة خطة الحصة للملف البيداغوجي الأسبوعي.")}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                اعتماد وحفظ الخطة للأسبوع ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMART GROUP BUILDER */}
      {activeTab === "groups" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  تنظيم وتشكيل الأفواج الشفاف
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  باني المجموعات التعاونية القائم على تكامل الكفاءات
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  تجنب التشكيل العشوائي؛ يوضح النظام أسباب اقتراح كل فوج مع الاحتفاظ بحق المعلم الكامل في التعديل أو التبديل.
                </p>
              </div>

              {/* Goal Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">الهدف البيداغوجي:</label>
                <select
                  value={groupsGoal}
                  onChange={(e) => setGroupsGoal(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2 font-medium"
                >
                  <option value="peer_tutoring">تعليم الأقران وتكامل الكفاءات</option>
                  <option value="complementary">تطابق الفجوات للمعالجة المركزة</option>
                  <option value="exam_sprint">تدريب امتحاني متقدم (البكالوريا)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Groups list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {smartGroups.map((group) => (
              <div key={group.id} className="workspace-card p-6 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{group.nameAr}</h3>
                      <span className="inline-block text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded mt-1">
                        {group.goalLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed mb-4">
                    <strong>الأساس البيداغوجي:</strong> {group.rationaleAr}
                  </p>

                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">أعضاء الفوج والدور المقترح</h4>
                  <div className="space-y-2">
                    {group.members.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{m.name}</p>
                          <p className="text-slate-500">{m.strength}</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium shrink-0">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                  <span className="text-xs text-slate-400">قابل للسحب والتعديل اليدوي</span>
                  <button
                    onClick={() => toast.success(`تم تثبيت تشكيل ${group.nameAr} للحصة التعاونية القادمة.`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    تأكيد الفوج
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONTEXT-LINKED TEACHER NOTES */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">الملاحظات التربوية المرتبطة بالسياق</h2>
            <p className="text-sm text-slate-600 mt-1">
              بدلاً من الأوراق المبعثرة أو الدفاتر غير المفهرسة، دوّن ملاحظاتك مباشرة مقابل التلميذ، الكفاءة، أو الفوج مع إمكانية البحث والوسوم ومستويات الخصوصية.
            </p>

            {/* Note Input Box */}
            <form onSubmit={handleCreateNote} className="mt-6 space-y-4">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="اكتب ملاحظتك البيداغوجية هنا... (مثال: لاحظت اليوم تحسناً كبيراً لدى أحمد في إيجاد المستقيم المقارب المائل، لكنه لا يزال يتردد في تحديد الوضعية النسبية)."
                className="w-full h-24 p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">نوع الملاحظة:</span>
                  <select
                    value={newNoteTag}
                    onChange={(e) => setNewNoteTag(e.target.value as any)}
                    className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg p-1.5 font-medium"
                  >
                    <option value="pedagogy">بيداغوجيا وطرق تدريس</option>
                    <option value="misconception">خطأ مفاهيمي مرصود</option>
                    <option value="progress">تقدم وإنجاز ملحوظ</option>
                    <option value="followup">تذكير بمتابعة خاصة</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  حفظ الملاحظة في السجل الأكاديمي
                </button>
              </div>
            </form>
          </div>

          {/* Notes list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">سجل الملاحظات المحفوظة</h3>
            {notes.map((note) => (
              <div key={note.id} className="workspace-card p-4 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{note.targetTitle}</span>
                    <span>· {note.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                      {note.tag}
                    </span>
                    <span>{note.date}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EVIDENCE ENGINE & RESEARCH DATABASE */}
      {activeTab === "evidence" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              قاعدة المعرفة والأدلة العلمية المعتمدة
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              الأدلة المعرفية المعتمدة في توصيات EduPulse
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              المنصة ترفض تماماً النماذج غير العلمية مثل "الأنماط التعلمية النمطية" (Learning Styles)، وتعتمد حصراً على علم النفس المعرفي المحكم، والأبحاث فوقية التحليل (Meta-analyses).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EVIDENCE_DATABASE.map((ev) => (
              <div key={ev.id} className="workspace-card p-6 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{ev.methodNameAr}</h3>
                      <p className="text-xs text-slate-500 font-medium">{ev.methodNameEn}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {ev.strength}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed mb-3">
                    <strong>الادعاء المعرفي:</strong> {ev.claim}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 mb-4">
                    <p className="text-slate-700">
                      <strong>حجم الأثر المقاس:</strong> {ev.keyEffectSizeOrMetric}
                    </p>
                    <p className="text-slate-700">
                      <strong>الفئة المبحوثة:</strong> {ev.populationStudied}
                    </p>
                    <p className="text-slate-700">
                      <strong>حدود الطريقة (Limitations):</strong> {ev.limitations}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <p className="font-bold text-blue-900 mb-1">كيفية التطبيق في القسم الجزائري:</p>
                    <p>{ev.recommendedClassroomApplication.inClassStep}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="line-clamp-1 italic">{ev.citation}</span>
                  <a
                    href={ev.doiOrLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold shrink-0"
                  >
                    DOI / المصدر ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
