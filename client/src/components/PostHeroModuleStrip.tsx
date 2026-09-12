import {
  Award,
  BookOpen,
  CalendarDays,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  UserRoundPlus,
  UsersRound,
  Brain,
  Layers,
  PhoneCall,
  Search,
  type LucideIcon,
} from "lucide-react";

type Props = { onSelect: (view: string) => void; isArabic: boolean };

type Module = { id: string; icon: LucideIcon; ar: string; en: string; tone: string; category?: string };

export const postHeroModules: Module[] = [
  { id: "overview", icon: LayoutDashboard, ar: "لوحة العمليات", en: "Operations Hub", tone: "from-blue-600 to-indigo-600" },
  { id: "professor", icon: Brain, ar: "مركز قرار الأستاذ", en: "Professor Cockpit", tone: "from-indigo-600 to-violet-600" },
  { id: "student_intel", icon: Sparkles, ar: "ذكاء الطالب والبكالوريا", en: "Student Intelligence", tone: "from-emerald-500 to-teal-600" },
  { id: "research_studio", icon: Search, ar: "أستوديو البحث وMCP", en: "Research & MCP", tone: "from-violet-500 to-purple-700" },
  { id: "registration", icon: UserRoundPlus, ar: "التوجيه والتسجيل", en: "Admissions Pipeline", tone: "from-teal-500 to-emerald-600" },
  { id: "learners", icon: GraduationCap, ar: "سجل التلاميذ والشعب", en: "Student Directory", tone: "from-fuchsia-500 to-pink-600" },
  { id: "attendance", icon: CalendarDays, ar: "الجدولة والحضور", en: "Scheduling & Attendance", tone: "from-cyan-500 to-sky-600" },
  { id: "payments", icon: CreditCard, ar: "المالية والمصروفات", en: "Finance & Tuition", tone: "from-amber-500 to-orange-600" },
  { id: "google_workspace", icon: Globe, ar: "بيئة Google الموحدة", en: "Google Workspace Hub", tone: "from-blue-500 to-emerald-500" },
  { id: "subjects", icon: BookOpen, ar: "المنهاج الجزائري", en: "Algerian Curriculum", tone: "from-blue-500 to-teal-600" },
  { id: "cefr", icon: Award, ar: "التقييم المستمر والدرجات", en: "Grades & Assessment", tone: "from-orange-500 to-amber-600" },
  { id: "guardians", icon: MessageCircle, ar: "التواصل والأولياء", en: "Guardian Omnichannel", tone: "from-rose-500 to-red-600" },
  { id: "crm", icon: UsersRound, ar: "نظام المعلم الميداني", en: "Educator CRM", tone: "from-blue-400 to-indigo-500" },
  { id: "reports", icon: FileText, ar: "التقارير الأكاديمية", en: "Academic Reports", tone: "from-slate-600 to-slate-800" },
  { id: "portal", icon: GraduationCap, ar: "بوابة الطالب الذاتية", en: "Self-Service Portal", tone: "from-teal-400 to-cyan-600" },
  { id: "ask", icon: Sparkles, ar: "أدوات ومساعد الذكاء", en: "Zia & AI Assistant", tone: "from-yellow-400 to-amber-500" },
];

export function PostHeroModuleStrip({ onSelect, isArabic }: Props) {
  return (
    <section id="module-suite" className="relative overflow-hidden border-y border-slate-200 bg-white px-6 py-16 text-slate-900 sm:px-8 sm:py-20">
      {/* Zoho-inspired subtle mesh and clear background */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-teal-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <span>نظام التشغيل المدرسي المتكامل</span>
            <span className="text-slate-400">·</span>
            <span>Zoho Education & Academic Cockpit</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl font-display">
            {isArabic ? (
              <>
                من التوجيه المدرسي وإدارة الأفواج،<br />
                <span className="text-blue-600">إلى قرارات التدريس القائمة على الأدلة.</span>
              </>
            ) : (
              <>
                From school admissions and stream guidance,<br />
                <span className="text-blue-600">to evidence-informed classroom decisions.</span>
              </>
            )}
          </h2>
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
            {isArabic
              ? "بيئة أكاديمية متكاملة مصممة خصيصاً للتعليم الثانوي الجزائري: جذوع مشتركة، 6 شعب رسمية، تخطيط حصص وفق علوم الإدراك، وجدول مراجعة متباعدة للطالب."
              : "A unified academic cockpit designed for the Algerian secondary school system: common cores, official streams, cognitive-load session planning, and spaced revision queues."}
          </p>
        </div>

        {/* Modules Grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {postHeroModules.map(({ id, icon: Icon, ar, en, tone }, index) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="group relative min-h-[136px] overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs transition duration-180 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <span
                className={`mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-sm transition group-hover:scale-105`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-3 block text-xs font-bold text-slate-900 line-clamp-1">{isArabic ? ar : en}</span>
              <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
                {String(index + 1).padStart(2, "0")} · فتح
              </span>
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {isArabic ? "معاملات المنهاج الجزائري الرسمية (1AS · 2AS · 3AS)" : "Official Algerian Baccalaureate Coefficients"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {isArabic ? "علوم الإدراك: Roediger & Karpicke (2006) · Sweller (1988)" : "Cognitive Science & Evidence-Grounded"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            {isArabic ? "جسور MCP: LobbyVoices و OpenScience" : "MCP Integrations: LobbyVoices & OpenScience"}
          </span>
        </div>
      </div>
    </section>
  );
}
