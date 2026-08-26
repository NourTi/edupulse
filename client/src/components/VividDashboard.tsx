import { BarChart3, BookOpen, CalendarCheck2, ChevronLeft, CirclePlus, ClipboardList, GraduationCap, HeartHandshake, Sparkles, UsersRound, WalletCards } from "lucide-react";

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

export function VividDashboard({ role, roleLabel, dateLabel, activeStudents, balanceDue, students, currentStudent, onNavigate, onRegister }: Props) {
  const isStudent = role === "student";
  const reviewCount = students.filter(student => student.status === "Review").length;
  const attendance = isStudent ? currentStudent.attendance : 92;
  const metrics = isStudent
    ? [
        { label: "الحضور", value: `${attendance}%`, detail: "ضمن السجل المعتمد", icon: CalendarCheck2, tone: "sky" },
        { label: "مستوى اللغة", value: `CEFR ${currentStudent.level}`, detail: "آخر تقييم معتمد", icon: BarChart3, tone: "violet" },
        { label: "المواد", value: currentStudent.subjects.length, detail: "مواد ضمن الخطة", icon: BookOpen, tone: "amber" },
      ]
    : [
        { label: "الطلاب النشطون", value: activeStudents, detail: "في قاعدة المؤسسة", icon: UsersRound, tone: "sky" },
        { label: "حضور اليوم", value: `${attendance}%`, detail: "عبر الأفواج المسجلة", icon: CalendarCheck2, tone: "emerald" },
        { label: "تحتاج متابعة", value: reviewCount + 4, detail: "مهام تنتظر إجراءً", icon: ClipboardList, tone: "coral" },
      ];

  return <div dir="rtl" className="-mx-5 -my-5 min-h-[calc(100vh-7rem)] bg-[#f5f7fb] px-5 py-6 text-slate-900 lg:-mx-8 lg:-my-7 lg:px-8 lg:py-8">
    <div className="mx-auto max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-[#4338ca] via-[#5b5ce2] to-[#1d9bb3] p-6 text-white shadow-[0_20px_55px_rgba(59,61,173,0.25)] sm:p-8">
        <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" /><div className="absolute -bottom-28 right-24 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="flex items-center gap-2 text-xs font-medium text-white/75"><Sparkles className="h-4 w-4" />{roleLabel} · {dateLabel}</div><h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">{isStudent ? "خطوتك التالية واضحة." : "كل نبض المؤسسة في مكان واحد."}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">{isStudent ? "تابع حضورك، موادك، وتطورك اللغوي من لوحة واحدة." : "إدارة الطلاب، الموظفين، التسجيل، المتابعة، والموارد من قاعدة مدرسية موحّدة."}</p></div>
          <div className="flex flex-wrap gap-3"><button onClick={() => onNavigate(isStudent ? "subjects" : "learners")} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5"><span>{isStudent ? "عرض خطة التعلم" : "فتح قاعدة الطلاب"}</span><ChevronLeft className="h-4 w-4" /></button>{role === "admin" && <button onClick={onRegister} className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-amber-950 shadow-lg transition hover:-translate-y-0.5"><CirclePlus className="h-4 w-4" />تسجيل طالب</button>}</div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(metric => { const Icon = metric.icon; const tone = metric.tone === "sky" ? "bg-sky-50 text-sky-700 ring-sky-100" : metric.tone === "violet" ? "bg-violet-50 text-violet-700 ring-violet-100" : metric.tone === "amber" ? "bg-amber-50 text-amber-700 ring-amber-100" : metric.tone === "emerald" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-rose-50 text-rose-700 ring-rose-100"; return <article key={metric.label} className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(35,49,82,0.07)] ring-1 ring-slate-100"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{metric.label}</p><p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{metric.value}</p><p className="mt-1 text-xs text-slate-400">{metric.detail}</p></div><div className={`rounded-2xl p-3 ring-1 ${tone}`}><Icon className="h-5 w-5" /></div></div></article>; })}</section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <article className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(35,49,82,0.07)] ring-1 ring-slate-100"><div className="flex items-center justify-between"><div><p className="text-xl font-black text-slate-900">{isStudent ? "خطة التعلم" : "قاعدة المؤسسة"}</p><p className="mt-1 text-sm text-slate-500">{isStudent ? "المواد والحضور والتقدم المعتمد" : "الطلاب، أولياء الأمور، والمتابعة في سجل موحد"}</p></div><button onClick={() => onNavigate(isStudent ? "subjects" : "learners")} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">عرض الكل</button></div>{isStudent ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{currentStudent.subjects.map(subject => <div key={subject} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />{subject}</div>)}</div> : <div className="mt-6 divide-y divide-slate-100">{students.slice(0, 5).map(student => <button key={student.id} onClick={() => onNavigate("learners")} className="flex w-full items-center justify-between gap-4 py-4 text-right transition hover:bg-slate-50"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 font-black text-indigo-700">{student.nameAr.slice(0, 1)}</div><div><p className="font-bold text-slate-800">{student.nameAr}</p><p className="mt-1 text-xs text-slate-400">{student.grade} · {student.guardian}</p></div></div><div className="text-left"><span className={`rounded-full px-3 py-1 text-xs font-bold ${student.status === "Review" ? "bg-rose-50 text-rose-600" : student.status === "New" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{statusLabel(student.status)}</span><p className="mt-2 text-xs text-slate-400">حضور {student.attendance || "—"}%</p></div></button>)}</div>}</article>
        <div className="space-y-6"><article className="rounded-3xl bg-[#172554] p-6 text-white shadow-[0_12px_35px_rgba(23,37,84,0.18)]"><div className="flex items-center justify-between"><div><p className="text-xl font-black">مركز الإجراءات</p><p className="mt-1 text-sm text-white/60">اختصارات للعمل اليومي</p></div><GraduationCap className="h-6 w-6 text-amber-300" /></div><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><button onClick={() => onNavigate("crm")} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-right transition hover:bg-white/15"><ClipboardList className="h-4 w-4 text-cyan-300" /><span className="text-sm">مهام المربين والمتابعة</span></button><button onClick={() => onNavigate("registration")} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-right transition hover:bg-white/15"><UsersRound className="h-4 w-4 text-amber-300" /><span className="text-sm">التسجيل والقبول</span></button><button onClick={() => onNavigate("payments")} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-right transition hover:bg-white/15"><WalletCards className="h-4 w-4 text-rose-300" /><span className="text-sm">المدفوعات والرسوم</span></button></div></article><article className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 p-6 ring-1 ring-amber-200/70"><div className="flex items-center gap-3"><div className="rounded-2xl bg-white p-3 text-amber-600 shadow-sm"><HeartHandshake className="h-5 w-5" /></div><div><p className="font-black text-amber-950">صحة المؤسسة المالية</p><p className="mt-1 text-xs text-amber-800/70">الرصيد المستحق داخل السجل</p></div></div><p className="mt-5 text-3xl font-black text-amber-950">{balanceDue.toLocaleString("ar-DZ")} <span className="text-sm font-bold">د.ج</span></p></article></div>
      </section>
    </div>
  </div>;
}
