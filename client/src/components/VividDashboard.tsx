import {
  Award,
  Bell,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  UserRoundPlus,
  UsersRound,
  WalletCards,
} from "lucide-react";

type DashboardStudent = { id: string; nameAr: string; grade: string; guardian: string; attendance: number; status: string };
type CurrentStudent = { nameAr: string; grade: string; level: string; attendance: number; subjects: string[] };

type Props = {
  role: "admin" | "finance_admin" | "registrar" | "teacher" | "counsellor" | "student" | "guardian";
  roleLabel: string;
  dateLabel: string;
  activeStudents: number;
  balanceDue: number;
  students: DashboardStudent[];
  currentStudent: CurrentStudent;
  onNavigate: (view: string) => void;
  onRegister: () => void;
};

const statusLabel = (status: string) => status === "Review" ? "مراجعة" : status === "New" ? "جديد" : "نشط";
export const dashboardStageLabel = (grade: string) => ({ preparatory: "التحضيري", primary: "الابتدائي", middle: "المتوسط", secondary: "الثانوي", higher: "التعليم العالي" } as Record<string, string>)[grade] ?? grade;

export const dashboardModules: Array<{ id: string; label: string; icon: typeof LayoutDashboard; tone: string; roles: Props["role"][] }> = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard, tone: "bg-indigo-50 text-indigo-600", roles: ["admin", "finance_admin", "registrar", "teacher", "counsellor", "student", "guardian"] },
  { id: "learners", label: "الطلاب", icon: UsersRound, tone: "bg-sky-50 text-sky-600", roles: ["admin", "registrar", "teacher", "counsellor"] },
  { id: "attendance", label: "الحضور", icon: CalendarDays, tone: "bg-cyan-50 text-cyan-600", roles: ["admin", "registrar", "teacher", "counsellor"] },
  { id: "subjects", label: "المواد", icon: BookOpen, tone: "bg-emerald-50 text-emerald-600", roles: ["admin", "teacher", "student"] },
  { id: "cefr", label: "التقييم", icon: Award, tone: "bg-violet-50 text-violet-600", roles: ["admin", "teacher", "student"] },
  { id: "payments", label: "المالية", icon: WalletCards, tone: "bg-amber-50 text-amber-600", roles: ["admin", "finance_admin"] },
  { id: "crm", label: "مساحة المربي", icon: ClipboardList, tone: "bg-rose-50 text-rose-600", roles: ["admin", "teacher", "counsellor"] },
  { id: "portal", label: "بوابة الأسرة", icon: GraduationCap, tone: "bg-fuchsia-50 text-fuchsia-600", roles: ["student", "guardian"] },
];

function Avatar({ name, tone = "from-indigo-500 to-cyan-400" }: { name: string; tone?: string }) {
  return <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${tone} text-xs font-black text-white shadow-sm`}>{name.slice(0, 1)}</span>;
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string | number; detail: string; icon: typeof UsersRound; tone: string }) {
  return <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(35,49,82,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(35,49,82,0.1)]"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div><span className={`rounded-2xl p-3 ${tone}`}><Icon className="h-5 w-5" /></span></div></article>;
}

function PanelTitle({ title, detail, action }: { title: string; detail?: string; action?: string }) {
  return <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-lg font-black text-slate-900">{title}</h2>{detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}</div>{action && <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">{action}</button>}</header>;
}

export function VividDashboard({ role, roleLabel, dateLabel, activeStudents, balanceDue, students, currentStudent, onNavigate, onRegister }: Props) {
  const isStudent = role === "student";
  const isGuardian = role === "guardian";
  const isPersonal = isStudent || isGuardian;
  const canViewLearners = ["admin", "registrar", "teacher", "counsellor"].includes(role);
  const canRegister = role === "admin" || role === "registrar";
  const canPay = role === "admin" || role === "finance_admin";
  const canUseCrm = ["admin", "teacher", "counsellor"].includes(role);
  const attendance = isStudent ? currentStudent.attendance : 92;
  const reviewCount = students.filter(student => student.status === "Review").length;
  const visibleModules = dashboardModules.filter(module => module.roles.includes(role));
  const primaryView = isStudent ? "subjects" : isGuardian ? "portal" : role === "finance_admin" ? "payments" : role === "counsellor" ? "support-evaluation" : "learners";

  return <div dir="rtl" className="-mx-5 -my-5 min-h-[calc(100vh-7rem)] bg-[#f7f9fc] px-4 py-5 text-slate-900 sm:px-6 lg:-mx-8 lg:-my-7 lg:px-8 lg:py-7">
    <div className="mx-auto max-w-[1480px]">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_232px]">
        <main className="min-w-0">
          <header className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_5px_20px_rgba(35,49,82,0.04)]"><div><p className="text-xs font-bold text-slate-400">{dateLabel}</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">مرحباً بك في EduPulse</h1><p className="mt-1 text-xs text-slate-500">مساحة {roleLabel} · إدارة واضحة للمؤسسة</p></div><div className="flex items-center gap-2"><button onClick={() => onNavigate("search")} className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-400 hover:border-indigo-200 hover:text-indigo-600 sm:flex"><Search className="h-4 w-4" />بحث سريع</button><button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="التنبيهات"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" /></button><Avatar name={roleLabel} tone="from-indigo-500 to-violet-500" /></div></header>

          <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label={isPersonal ? "الحضور" : "الطلاب النشطون"} value={isPersonal ? `${attendance}%` : activeStudents} detail={isPersonal ? "ضمن السجل المعتمد" : "في قاعدة المؤسسة"} icon={isPersonal ? CalendarCheck2 : UsersRound} tone="bg-sky-50 text-sky-600" />
            <MetricCard label={isPersonal ? "مستوى اللغة" : "حضور اليوم"} value={isPersonal ? `CEFR ${currentStudent.level}` : `${attendance}%`} detail={isPersonal ? "آخر تقييم معتمد" : "عبر الأفواج المسجلة"} icon={Award} tone="bg-violet-50 text-violet-600" />
            <MetricCard label={isPersonal ? "المواد" : "تحتاج متابعة"} value={isPersonal ? currentStudent.subjects.length : reviewCount + 4} detail={isPersonal ? "مواد ضمن الخطة" : "مهام تنتظر إجراءً"} icon={isPersonal ? BookOpen : ClipboardList} tone="bg-rose-50 text-rose-600" />
            {canPay ? <MetricCard label="الرصيد المستحق" value={`${balanceDue.toLocaleString("ar-DZ")} د.ج`} detail="داخل سجل المؤسسة" icon={WalletCards} tone="bg-amber-50 text-amber-600" /> : <MetricCard label="المرحلة" value={dashboardStageLabel(currentStudent.grade)} detail="التصنيف التعليمي" icon={GraduationCap} tone="bg-emerald-50 text-emerald-600" />}
          </section>

          <section className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(270px,0.55fr)]">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(35,49,82,0.06)]"><PanelTitle title={isPersonal ? "خطة التعلم" : "دروس اليوم"} detail={isPersonal ? "المواد والحضور والتقدم المعتمد" : "ملخص العمل اليومي للمؤسسة"} action="عرض الكل" />{isPersonal ? <div className="grid gap-3 p-5 sm:grid-cols-2">{currentStudent.subjects.slice(0, 6).map((subject, index) => <button key={subject} onClick={() => onNavigate("subjects")} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-right text-sm font-bold text-slate-700 hover:border-indigo-100 hover:bg-indigo-50"><span className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${index % 2 ? "bg-cyan-500" : "bg-indigo-500"}`} />{subject}</span><ChevronLeft className="h-4 w-4 text-slate-300" /></button>)}</div> : <div className="space-y-3 p-5"><div className="flex items-center gap-4 rounded-xl border-r-4 border-indigo-500 bg-indigo-50/60 p-4"><span className="text-sm font-black text-indigo-700">09:00</span><div className="min-w-0 flex-1"><p className="font-black text-slate-800">اللغة الإنجليزية</p><p className="mt-1 text-xs text-slate-500">الفوج الثانوي · قاعة 02</p></div><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-indigo-600">قادم</span></div><div className="flex items-center gap-4 rounded-xl border-r-4 border-cyan-500 bg-cyan-50/60 p-4"><span className="text-sm font-black text-cyan-700">12:00</span><div className="min-w-0 flex-1"><p className="font-black text-slate-800">مراجعة الحضور</p><p className="mt-1 text-xs text-slate-500">تحديث السجلات · كل الأفواج</p></div><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-cyan-600">اليوم</span></div></div>}</article>
            <aside className="space-y-5"><article className="rounded-2xl bg-gradient-to-br from-[#253b9a] to-[#4f46e5] p-5 text-white shadow-[0_15px_35px_rgba(55,66,170,0.2)]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-white/65">مركز الإجراءات</p><p className="mt-1 text-lg font-black">ابدأ من هنا</p></div><HeartHandshake className="h-5 w-5 text-amber-300" /></div><div className="mt-4 grid gap-2">{canUseCrm && <button onClick={() => onNavigate("crm")} className="flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2.5 text-right text-xs font-bold hover:bg-white/20"><ClipboardList className="h-4 w-4" />مهام المربين والمتابعة</button>}{canRegister && <button onClick={onRegister} className="flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2.5 text-right text-xs font-bold text-amber-950 hover:bg-amber-200"><UserRoundPlus className="h-4 w-4" />تسجيل طالب</button>}{canPay && <button onClick={() => onNavigate("payments")} className="flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2.5 text-right text-xs font-bold hover:bg-white/20"><WalletCards className="h-4 w-4" />فتح المدفوعات</button>}{!canUseCrm && !canRegister && !canPay && <p className="rounded-xl bg-white/10 px-3 py-3 text-xs text-white/70">الوحدات المصرح بها تظهر في القائمة.</p>}</div></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(35,49,82,0.06)]"><div className="flex items-center justify-between"><p className="font-black">تقدم المساحة</p><MoreHorizontal className="h-4 w-4 text-slate-400" /></div><div className="mt-4 flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-full border-4 border-indigo-100 border-t-indigo-600 text-sm font-black text-indigo-700">72%</div><p className="text-xs leading-6 text-slate-500">أكمل إعداد السجلات والموارد للوصول إلى مساحة أكثر فاعلية.</p></div></article></aside>
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(270px,0.75fr)]"><article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(35,49,82,0.06)]"><PanelTitle title={isPersonal ? "ملخصك الأكاديمي" : "آخر سجلات الطلاب"} detail={isPersonal ? "البيانات التي تحتاجها في بداية اليوم" : "الطلاب، الأولياء، والحالة الحالية"} action="عرض الكل" />{isPersonal ? <div className="grid gap-4 p-5 sm:grid-cols-3"><div className="rounded-xl bg-sky-50 p-4"><p className="text-xs font-bold text-sky-700">الحضور</p><p className="mt-3 text-2xl font-black text-slate-900">{attendance}%</p></div><div className="rounded-xl bg-violet-50 p-4"><p className="text-xs font-bold text-violet-700">المستوى</p><p className="mt-3 text-2xl font-black text-slate-900">CEFR {currentStudent.level}</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">المواد</p><p className="mt-3 text-2xl font-black text-slate-900">{currentStudent.subjects.length}</p></div></div> : canViewLearners ? <div className="divide-y divide-slate-100">{students.slice(0, 5).map(student => <button key={student.id} onClick={() => onNavigate("learners")} className="flex w-full items-center justify-between gap-4 px-5 py-3 text-right transition hover:bg-slate-50"><div className="flex items-center gap-3"><Avatar name={student.nameAr} /><div><p className="font-bold text-slate-800">{student.nameAr}</p><p className="mt-1 text-xs text-slate-400">{dashboardStageLabel(student.grade)} · {student.guardian}</p></div></div><div className="text-left"><span className={`rounded-full px-3 py-1 text-xs font-bold ${student.status === "Review" ? "bg-rose-50 text-rose-600" : student.status === "New" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{statusLabel(student.status)}</span><p className="mt-2 text-xs text-slate-400">حضور {student.attendance || "—"}%</p></div></button>)}</div> : <div className="p-5 text-sm leading-7 text-slate-500">لا توجد سجلات شخصية إضافية معروضة في هذه المساحة.</div>}</article><aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(35,49,82,0.06)]"><div className="flex items-center justify-between"><div><p className="font-black">النشاط الأخير</p><p className="mt-1 text-xs text-slate-400">آخر تحديثات المساحة</p></div><Sparkles className="h-5 w-5 text-indigo-500" /></div><div className="mt-5 space-y-4 text-xs text-slate-600"><p className="border-r-2 border-indigo-400 pr-3">تم تحديث سجل الحضور لفوج اللغة الإنجليزية.</p><p className="border-r-2 border-cyan-400 pr-3">أضيفت ملاحظة جديدة إلى مساحة المتابعة.</p><p className="border-r-2 border-amber-400 pr-3">يوجد {balanceDue.toLocaleString("ar-DZ")} د.ج ضمن الرصيد المستحق.</p></div></aside></section>
        </main>

        <aside className="order-first xl:order-last"><div className="sticky top-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_28px_rgba(35,49,82,0.06)]"><div className="mb-3 flex items-center justify-between px-2"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white"><LayoutDashboard className="h-4 w-4" /></span><div><p className="text-sm font-black text-slate-900">EduPulse</p><p className="text-[10px] text-slate-400">مركز المؤسسة</p></div></div><Menu className="h-4 w-4 text-slate-400" /></div><nav className="space-y-1">{visibleModules.map(({ id, label, icon: Icon, tone }) => <button key={id} onClick={() => onNavigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-xs font-bold transition ${id === "overview" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span><span className="flex-1">{label}</span>{id === "overview" && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}</button>)}</nav><div className="mt-4 border-t border-slate-100 pt-4"><button onClick={() => onNavigate("ask")} className="flex w-full items-center gap-3 rounded-xl bg-amber-50 px-3 py-3 text-right text-xs font-bold text-amber-800 hover:bg-amber-100"><MessageCircle className="h-4 w-4" />مساعد EduPulse</button><button onClick={() => onNavigate("reports")} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-xs font-bold text-slate-500 hover:bg-slate-50"><CheckCircle2 className="h-4 w-4" />التقارير والمتابعة</button></div></div></aside>
      </div>
    </div>
  </div>;
}
