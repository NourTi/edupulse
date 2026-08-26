import {
  Award,
  Bell,
  BookOpen,
  Cake,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  MessageCircle,
  NotebookPen,
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
  role: "admin" | "teacher" | "student" | "guardian";
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

const modules = [
  { id: "overview", label: "لوحة التحكم", icon: LayoutDashboard, tone: "bg-indigo-100 text-indigo-700" },
  { id: "attendance", label: "الجدول والحضور", icon: CalendarDays, tone: "bg-cyan-100 text-cyan-700" },
  { id: "payments", label: "المدفوعات", icon: WalletCards, tone: "bg-amber-100 text-amber-700" },
  { id: "guardians", label: "التواصل", icon: MessageCircle, tone: "bg-rose-100 text-rose-700" },
  { id: "subjects", label: "الدروس والمواد", icon: BookOpen, tone: "bg-emerald-100 text-emerald-700" },
  { id: "registration", label: "التسجيل", icon: UserRoundPlus, tone: "bg-violet-100 text-violet-700" },
  { id: "learners", label: "سجل الطلاب", icon: UsersRound, tone: "bg-sky-100 text-sky-700" },
  { id: "cefr", label: "الدرجات والتقييم", icon: Award, tone: "bg-orange-100 text-orange-700" },
  { id: "portal", label: "بوابة الأسرة", icon: GraduationCap, tone: "bg-fuchsia-100 text-fuchsia-700" },
  { id: "ask", label: "أدوات الذكاء", icon: Sparkles, tone: "bg-yellow-100 text-yellow-700" },
];

function Avatar({ name, tone = "from-indigo-500 to-cyan-400" }: { name: string; tone?: string }) {
  return <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${tone} text-xs font-black text-white shadow-sm`}>{name.slice(0, 1)}</span>;
}

export function VividDashboard({ role, roleLabel, dateLabel, activeStudents, balanceDue, students, currentStudent, onNavigate, onRegister }: Props) {
  const isStudent = role === "student";
  const reviewCount = students.filter(student => student.status === "Review").length;
  const attendance = isStudent ? currentStudent.attendance : 92;
  const metrics = isStudent
    ? [
        { label: "الحضور", value: `${attendance}%`, detail: "ضمن السجل المعتمد", icon: CalendarCheck2, tone: "bg-cyan-50 text-cyan-700" },
        { label: "مستوى اللغة", value: `CEFR ${currentStudent.level}`, detail: "آخر تقييم معتمد", icon: Award, tone: "bg-violet-50 text-violet-700" },
        { label: "المواد", value: currentStudent.subjects.length, detail: "مواد ضمن الخطة", icon: BookOpen, tone: "bg-amber-50 text-amber-700" },
      ]
    : [
        { label: "الطلاب النشطون", value: activeStudents, detail: "في قاعدة المؤسسة", icon: UsersRound, tone: "bg-cyan-50 text-cyan-700" },
        { label: "حضور اليوم", value: `${attendance}%`, detail: "عبر الأفواج المسجلة", icon: CalendarCheck2, tone: "bg-emerald-50 text-emerald-700" },
        { label: "تحتاج متابعة", value: reviewCount + 4, detail: "مهام تنتظر إجراءً", icon: ClipboardList, tone: "bg-rose-50 text-rose-700" },
      ];

  return <div dir="rtl" className="-mx-5 -my-5 min-h-[calc(100vh-7rem)] bg-[#f4f7fc] px-4 py-5 text-slate-900 sm:px-6 lg:-mx-8 lg:-my-7 lg:px-8 lg:py-7">
    <div className="mx-auto max-w-[1480px]">
      <section className="rounded-[1.65rem] border border-slate-200/70 bg-white/90 px-4 py-3 shadow-[0_12px_40px_rgba(30,58,138,0.08)] backdrop-blur sm:px-5">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:justify-between lg:overflow-visible">
          {modules.map(({ id, label, icon: Icon, tone }) => <button key={id} onClick={() => onNavigate(id)} className={`group flex min-w-[86px] shrink-0 flex-col items-center gap-2 rounded-2xl px-2 py-2 text-center transition hover:-translate-y-0.5 hover:bg-slate-50 ${id === "overview" ? "bg-indigo-50/80" : ""}`}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone} transition group-hover:scale-105`}><Icon className="h-[18px] w-[18px]" /></span><span className="whitespace-nowrap text-[10px] font-bold text-slate-600">{label}</span>
          </button>)}
        </div>
      </section>

      <section className="mt-6 flex flex-col gap-4 rounded-[1.65rem] bg-gradient-to-l from-[#5146e5] via-[#6566e9] to-[#28b6c6] p-6 text-white shadow-[0_22px_55px_rgba(79,70,229,0.22)] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-semibold text-white/80"><Sparkles className="h-4 w-4" />{roleLabel} · {dateLabel}</div><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{isStudent ? "خطوتك التالية واضحة." : "مساحة العمل اليومية جاهزة."}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">{isStudent ? "تابع حضورك، موادك، وتطورك اللغوي من لوحة واحدة." : "راجع الدروس، الطلاب، الإعلانات، والتكليفات من مركز تشغيل واحد."}</p></div>
        <div className="flex flex-wrap gap-3"><button onClick={() => onNavigate(isStudent ? "subjects" : "learners")} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5"><span>{isStudent ? "عرض خطة التعلم" : "فتح قاعدة الطلاب"}</span><ChevronLeft className="h-4 w-4" /></button>{role === "admin" && <button onClick={onRegister} className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-amber-950 shadow-lg transition hover:-translate-y-0.5"><Plus className="h-4 w-4" />تسجيل طالب</button>}</div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(metric => { const Icon = metric.icon; return <article key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(35,49,82,0.06)]"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">{metric.label}</p><p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{metric.value}</p><p className="mt-1 text-xs text-slate-400">{metric.detail}</p></div><div className={`rounded-2xl p-3 ${metric.tone}`}><Icon className="h-5 w-5" /></div></div></article>; })}</section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_330px]">
        <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(35,49,82,0.06)]"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-lg font-black text-slate-900">{isStudent ? "خطة التعلم" : "دروس اليوم"}</h2><p className="mt-1 text-xs text-slate-400">{isStudent ? "المواد والحضور والتقدم المعتمد" : "Always know what’s coming up with your dashboard"}</p></div><div className="flex items-center gap-2"><button onClick={() => onNavigate("attendance")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">عرض المنتهية</button><button onClick={() => onNavigate("attendance")} className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" aria-label="فتح الجدول"><CalendarDays className="h-4 w-4" /></button></div></header>
          {isStudent ? <div className="grid gap-3 p-5 sm:grid-cols-2">{currentStudent.subjects.map(subject => <div key={subject} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />{subject}</div>)}</div> : <div className="space-y-3 p-4"><LessonCard time="12:00" title="English" room="مختبر الحاسوب" accent="border-rose-400" owner="Donna Swanson" progress={[3, 1, 1]} note="يوم رائع للتعلم!" copy="أنجز الطلاب تقدماً جيداً. راجع ملاحظات الحصة قبل المتابعة." /><LessonCard time="16:00" title="Spanish · Level 1" room="قاعة المحاضرات" accent="border-pink-500" owner="Jonathan Marks" progress={[3, 2, 1]} note="تحتاج مناقشة مع الطالب" copy="يرجى مراجعة ملاحظات الدرس والتحضير للأسبوع القادم." /></div>}
        </article>

        <aside className="space-y-4"><SideCard icon={NotebookPen} title="إعلانات" tone="indigo"><p className="font-bold text-slate-700">تحديث ساعات العمل</p><p className="mt-1 text-xs text-slate-400">من إدارة المؤسسة · قبل ساعتين</p></SideCard><SideCard icon={Bell} title="الإشعارات" tone="cyan"><div className="space-y-3 text-xs leading-5 text-slate-600"><p className="border-r-2 border-cyan-400 pr-3">تمت إضافة اجتماع أولياء الأمور إلى الجدول.</p><p className="border-r-2 border-cyan-400 pr-3">تم تحديث سجل الحضور لفوج اللغة الإنجليزية.</p></div></SideCard><SideCard icon={Cake} title="أعياد الميلاد" tone="rose"><div className="flex items-center gap-3"><Avatar name="ك" tone="from-rose-400 to-orange-300" /><div><p className="font-bold text-slate-700">كاثرين ساور</p><p className="text-xs text-slate-400">تتم 26 عاماً اليوم</p></div></div></SideCard><SideCard icon={CheckCircle2} title="قائمة الإنجاز" tone="emerald"><div className="flex items-center justify-between text-xs text-slate-500"><span>بدء إعداد المساحة</span><span className="font-black text-emerald-600">10%</span></div><div className="mt-3 h-2 rounded-full bg-emerald-100"><div className="h-full w-[10%] rounded-full bg-emerald-500" /></div></SideCard></aside>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_330px]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(35,49,82,0.06)]"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">{isStudent ? "ملخصك الأكاديمي" : "قاعدة الطلاب"}</h2><p className="mt-1 text-xs text-slate-400">{isStudent ? "البيانات التي تحتاجها في بداية اليوم" : "الطلاب، الأولياء، والحالة الحالية"}</p></div><div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-400 sm:flex"><Search className="h-3.5 w-3.5" />بحث سريع</div><button onClick={() => onNavigate(isStudent ? "reports" : "learners")} className="text-xs font-bold text-indigo-600">عرض الكل</button></div></div>{isStudent ? <div className="mt-5 grid gap-3 sm:grid-cols-3"><InfoStat label="الحضور" value={`${attendance}%`} icon={CalendarCheck2} /><InfoStat label="المستوى" value={`CEFR ${currentStudent.level}`} icon={Award} /><InfoStat label="المواد" value={String(currentStudent.subjects.length)} icon={BookOpen} /></div> : <div className="mt-4 divide-y divide-slate-100">{students.slice(0, 4).map(student => <button key={student.id} onClick={() => onNavigate("learners")} className="flex w-full items-center justify-between gap-4 py-3 text-right transition hover:bg-slate-50"><div className="flex items-center gap-3"><Avatar name={student.nameAr} /><div><p className="font-bold text-slate-800">{student.nameAr}</p><p className="mt-1 text-xs text-slate-400">{student.grade} · {student.guardian}</p></div></div><div className="text-left"><span className={`rounded-full px-3 py-1 text-xs font-bold ${student.status === "Review" ? "bg-rose-50 text-rose-600" : student.status === "New" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{statusLabel(student.status)}</span><p className="mt-2 text-xs text-slate-400">حضور {student.attendance || "—"}%</p></div></button>)}</div>}</article>
        <aside className="space-y-4"><article className="rounded-2xl bg-[#202b63] p-5 text-white shadow-[0_12px_35px_rgba(32,43,99,0.18)]"><div className="flex items-center justify-between"><div><p className="font-black">مركز الإجراءات</p><p className="mt-1 text-xs text-white/60">اختصارات للعمل اليومي</p></div><HeartHandshake className="h-5 w-5 text-amber-300" /></div><div className="mt-4 grid gap-2"><ActionButton label="مهام المربين والمتابعة" icon={ClipboardList} onClick={() => onNavigate("crm")} /><ActionButton label="التسجيل والقبول" icon={UserRoundPlus} onClick={() => onNavigate("registration")} /><ActionButton label="المدفوعات والإيصالات" icon={WalletCards} onClick={() => onNavigate("payments")} /></div></article><article className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-5"><div className="flex items-center gap-3"><span className="rounded-xl bg-white p-2.5 text-amber-600 shadow-sm"><WalletCards className="h-4 w-4" /></span><div><p className="font-black text-amber-950">صحة المؤسسة المالية</p><p className="mt-1 text-xs text-amber-800/70">الرصيد المستحق داخل السجل</p></div></div><p className="mt-5 text-2xl font-black text-amber-950">{balanceDue.toLocaleString("ar-DZ")} <span className="text-sm">د.ج</span></p></article></aside>
      </section>
    </div>
  </div>;
}

function LessonCard({ time, title, room, accent, owner, progress, note, copy }: { time: string; title: string; room: string; accent: string; owner: string; progress: number[]; note: string; copy: string }) {
  return <article className={`rounded-xl border-r-4 ${accent} border-y border-l border-slate-100 bg-white p-4 shadow-[0_4px_18px_rgba(35,49,82,0.04)]`}><div className="flex flex-col gap-4 lg:flex-row lg:items-start"><div className="min-w-20"><p className="text-lg font-black text-slate-800">{time}</p><p className="mt-1 text-xs text-slate-400">ساعة واحدة</p></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-800">{title}</p><span className="text-xs text-slate-400">· {room}</span></div><p className="mt-4 text-xs font-semibold text-slate-600">{note}</p><p className="mt-2 text-xs leading-5 text-slate-400">{copy}</p></div><div className="min-w-44"><div className="flex items-center justify-between text-[11px] text-slate-400"><span>{owner}</span><span className="font-bold text-slate-600">{progress[0]} حاضر</span></div><div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100">{progress.map((value, index) => <span key={index} className={`${index === 0 ? "bg-emerald-400" : index === 1 ? "bg-amber-300" : "bg-rose-400"}`} style={{ width: `${value * 18}%` }} />)}</div><div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>ملاحظات 2</span><span>مهام 1</span></div></div></div></article>;
}

function SideCard({ icon: Icon, title, tone, children }: { icon: typeof Bell; title: string; tone: "indigo" | "cyan" | "rose" | "emerald"; children: React.ReactNode }) {
  const tones = { indigo: "bg-indigo-50 text-indigo-600", cyan: "bg-cyan-50 text-cyan-600", rose: "bg-rose-50 text-rose-600", emerald: "bg-emerald-50 text-emerald-600" };
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(35,49,82,0.05)]"><div className="mb-3 flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></span><h3 className="text-sm font-black text-slate-700">{title}</h3></div>{children}</article>;
}

function InfoStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Award }) {
  return <div className="rounded-xl bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">{label}</span><Icon className="h-4 w-4 text-indigo-500" /></div><p className="mt-4 text-2xl font-black text-slate-800">{value}</p></div>;
}

function ActionButton({ label, icon: Icon, onClick }: { label: string; icon: typeof ClipboardList; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-3 rounded-xl bg-white/10 p-3 text-right text-xs font-semibold transition hover:bg-white/15"><Icon className="h-4 w-4 text-cyan-300" /><span>{label}</span></button>;
}
