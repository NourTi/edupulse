import { Award, BookOpen, CalendarDays, CreditCard, FileText, GraduationCap, LayoutDashboard, MessageCircle, Sparkles, UserRoundPlus, UsersRound, type LucideIcon } from "lucide-react";

type Props = { onSelect: (view: string) => void; isArabic: boolean };

type Module = { id: string; icon: LucideIcon; ar: string; en: string; tone: string };

export const postHeroModules: Module[] = [
  { id: "overview", icon: LayoutDashboard, ar: "لوحة التحكم", en: "Dashboard", tone: "from-indigo-500 to-violet-500" },
  { id: "attendance", icon: CalendarDays, ar: "الجدولة والحضور", en: "Scheduling", tone: "from-cyan-500 to-sky-500" },
  { id: "payments", icon: CreditCard, ar: "المدفوعات", en: "Payments", tone: "from-amber-400 to-orange-500" },
  { id: "guardians", icon: MessageCircle, ar: "التواصل", en: "Communication", tone: "from-rose-400 to-pink-500" },
  { id: "subjects", icon: BookOpen, ar: "إدارة الدروس", en: "Lessons", tone: "from-emerald-400 to-teal-500" },
  { id: "registration", icon: UserRoundPlus, ar: "صفحة التسجيل", en: "Registration", tone: "from-violet-400 to-purple-600" },
  { id: "crm", icon: UsersRound, ar: "نظام المعلم", en: "Educator CRM", tone: "from-blue-400 to-indigo-500" },
  { id: "learners", icon: GraduationCap, ar: "سجل الطلاب", en: "Student CRM", tone: "from-fuchsia-400 to-purple-500" },
  { id: "cefr", icon: Award, ar: "الدرجات والتقييم", en: "Grades", tone: "from-orange-400 to-red-500" },
  { id: "reports", icon: FileText, ar: "التقارير", en: "Reports", tone: "from-slate-500 to-slate-700" },
  { id: "portal", icon: GraduationCap, ar: "بوابة الطالب", en: "Student portal", tone: "from-teal-400 to-cyan-600" },
  { id: "ask", icon: Sparkles, ar: "أدوات الذكاء", en: "AI tools", tone: "from-yellow-400 to-amber-500" },
];

export function PostHeroModuleStrip({ onSelect, isArabic }: Props) {
  return <section id="module-suite" className="relative overflow-hidden border-y border-slate-200 bg-gradient-to-br from-[#eefaff] via-[#f7f5ff] to-[#fff7f0] px-6 py-20 text-slate-900 sm:px-8 sm:py-24">
    <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl" /><div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
    <div className="relative mx-auto max-w-7xl">
      <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-600">{isArabic ? "مساحة EduPulse" : "The EduPulse workspace"}</p><h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">{isArabic ? <>كل أدوات المدرسة،<br /><span className="bg-gradient-to-l from-indigo-600 via-cyan-600 to-emerald-500 bg-clip-text text-transparent">في مسار بصري واحد.</span></> : <>Your school tools,<br /><span className="bg-gradient-to-l from-indigo-600 via-cyan-600 to-emerald-500 bg-clip-text text-transparent">in one visual flow.</span></>}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{isArabic ? "بدلاً من قوائم معتمة، يضع EduPulse كل وظيفة أمامك كاختصار واضح: من الجدولة والتسجيل إلى الدرجات، التواصل، ونظام المعلم." : "Instead of a murky menu, EduPulse makes every workflow visible: scheduling, registration, grades, communication, and educator CRM."}</p></div>
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{postHeroModules.map(({ id, icon: Icon, ar, en, tone }, index) => <button key={id} onClick={() => onSelect(id)} className={`group relative min-h-[132px] overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/80 p-4 text-center shadow-[0_12px_30px_rgba(41,62,120,0.08)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(41,62,120,0.15)] ${index === 7 ? "ring-2 ring-indigo-300 ring-offset-2" : ""}`}><span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg shadow-indigo-200/40 transition group-hover:scale-105`}><Icon className="h-5 w-5" /></span><span className="mt-4 block text-xs font-black text-slate-800">{isArabic ? ar : en}</span><span className="mt-1 block text-[10px] font-medium text-slate-400">{String(index + 1).padStart(2, "0")}</span>{index === 7 && <span className="absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />}</button>)}</div>
      <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />{isArabic ? "أدوار منفصلة للمدير والمعلم والطالب وولي الأمر" : "Separate views for administrators, teachers, students, and guardians"}</span><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-2"><span className="h-2 w-2 rounded-full bg-indigo-500" />{isArabic ? "واجهة عربية أولاً" : "Arabic-first interface"}</span></div>
    </div>
  </section>;
}
