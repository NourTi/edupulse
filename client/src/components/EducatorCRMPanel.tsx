import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Check, ClipboardList, FileText, HeartHandshake, Library, MessageSquareText, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type Props = { isArabic: boolean; desktopRuntime?: boolean };

type Task = { id?: string; title: string; meta: string; done: boolean; category?: "follow_up" | "essay" | "behavior" | "mentorship" | "report" };

const initialTasks: Task[] = [
  { title: "مراجعة مسودة رانيا", meta: "Essay pipeline · اليوم", done: false, category: "essay" },
  { title: "تحديث ملاحظة حضور يوسف", meta: "Behavior follow-up · هذا الأسبوع", done: false, category: "behavior" },
  { title: "تحضير جلسة الإرشاد لأمل", meta: "Mentorship · الخميس", done: true, category: "mentorship" },
];

export function EducatorCRMPanel({ isArabic, desktopRuntime = false }: Props) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const serverTasksQuery = trpc.records.educatorTasks.useQuery(undefined, { enabled: Boolean(user) && !desktopRuntime, retry: false });
  const createTaskMutation = trpc.records.createEducatorTask.useMutation();
  const completeTaskMutation = trpc.records.completeEducatorTask.useMutation();
  const serverRecordsQuery = trpc.records.educatorRecords.useQuery(undefined, { enabled: Boolean(user) && !desktopRuntime, retry: false });
  const recordCount = (category: "essay" | "behavior" | "mentorship" | "resource" | "language_evolution" | "client") => serverRecordsQuery.data?.filter(record => record.category === category).length ?? 0;
  const essayCount = (stage: string, fallback: string) => serverRecordsQuery.isSuccess ? String(serverRecordsQuery.data.filter(record => record.category === "essay" && record.stage === stage).length) : fallback;

  useEffect(() => {
    if (!serverTasksQuery.isSuccess) return;
    setTasks(serverTasksQuery.data.map(task => ({ id: task.id, title: task.title, meta: task.category.replace("_", " "), done: Boolean(task.completedAt), category: task.category })));
  }, [serverTasksQuery.data, serverTasksQuery.isSuccess]);

  const toggle = (index: number) => {
    const task = tasks[index];
    if (!task) return;
    if (task.done && task.id) return;
    setTasks(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, done: true } : item));
    if (task.id && !desktopRuntime) completeTaskMutation.mutate({ taskId: task.id }, { onError: () => toast.error(isArabic ? "تعذر تحديث المهمة." : "Could not update task.") });
  };
  const addTask = () => {
    const title = isArabic ? "متابعة جديدة" : "New follow-up";
    if (user && !desktopRuntime) {
      createTaskMutation.mutate({ title, category: "follow_up" }, { onSuccess: task => { if (task) setTasks(current => [{ id: task.id, title: task.title, meta: isArabic ? "مهمة مدرسية · الآن" : "School task · now", done: false, category: task.category }, ...current]); toast.success(isArabic ? "تمت إضافة المتابعة." : "Follow-up added."); }, onError: () => toast.error(isArabic ? "تعذر حفظ المتابعة." : "Could not save follow-up.") });
      return;
    }
    setTasks(current => [...current, { title, meta: isArabic ? "مهمة مدرسية · الآن" : "School task · now", done: false, category: "follow_up" }]);
    toast.success(isArabic ? "تمت إضافة المتابعة محليًا." : "Follow-up added locally.");
  };
  const labels = isArabic ? { eyebrow: "English Teacher Master System", title: "عمل المعلم، كسجل متصل.", copy: "اجمع المهمة، الدليل، المحادثة، والخطوة التالية في مسار واحد قابل للمراجعة.", tasks: "المهام والمتابعات", essays: "مسار المقالات", behavior: "السلوك والمشاركة", mentoring: "خط زمني للإرشاد", resources: "مكتبة الموارد", evolution: "تطور اللغة" } : { eyebrow: "English Teacher Master System", title: "Teaching work, connected.", copy: "Keep tasks, evidence, conversations, and next steps in one reviewable educator record.", tasks: "Tasks & follow-ups", essays: "Essay pipeline", behavior: "Behavior & participation", mentoring: "Mentorship timeline", resources: "Resource library", evolution: "Language evolution" };
  return <div className="space-y-6">
    <section><p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/45">{labels.eyebrow}</p><h2 className="text-display text-4xl leading-none sm:text-5xl">{labels.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">{labels.copy}</p></section>
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="surface-panel rounded-2xl p-5"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">{labels.tasks}</p><p className="mt-1 text-xs text-white/45">{isArabic ? "لا شيء يضيع بين الحصص." : "Nothing gets lost between lessons."}</p></div><button onClick={addTask} aria-label={isArabic ? "إضافة مهمة" : "Add task"} className="rounded-full border border-white/15 p-2 text-white/60 hover:border-white/40 hover:text-white"><Plus className="h-4 w-4" /></button></div><div className="mt-5 space-y-2">{tasks.map((task, index) => <button key={`${task.title}-${index}`} onClick={() => toggle(index)} className="flex w-full items-start gap-3 rounded-xl border border-white/8 p-3 text-right transition hover:bg-white/5"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${task.done ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/25 text-transparent"}`}><Check className="h-3 w-3" /></span><span className="min-w-0"><span className={`block text-sm ${task.done ? "text-white/45 line-through" : "text-white/85"}`}>{task.title}</span><span className="mt-1 block text-xs text-white/40">{task.meta}</span></span></button>)}</div></article>
      <article className="surface-panel rounded-2xl p-5"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-sky-100/70" /><p className="text-display text-3xl">{labels.essays}</p></div><div className="mt-6 grid grid-cols-3 gap-2 text-center">{[["Idea", essayCount("idea", "03")], ["Draft", essayCount("draft", "05")], ["Review", essayCount("review", "02")]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 p-3"><p className="text-2xl text-display">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/40">{label}</p></div>)}</div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-sky-100/75" /></div><p className="mt-3 text-xs leading-5 text-white/45">{isArabic ? "من فكرة أولية إلى تغذية راجعة ثم نسخة معتمدة، مع دليل واضح لكل تغيير." : "From idea to feedback to approved version, with evidence for each revision."}</p></article>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[{ icon: HeartHandshake, title: labels.mentoring, ar: "جلسات موثقة", en: "documented sessions", category: "mentorship" as const }, { icon: MessageSquareText, title: labels.behavior, ar: "سجلات مشاركة", en: "participation records", category: "behavior" as const }, { icon: Library, title: labels.resources, ar: "موارد معتمدة", en: "approved resources", category: "resource" as const }, { icon: TrendingUp, title: labels.evolution, ar: "سجلات تطور", en: "evolution records", category: "language_evolution" as const }].map(({ icon: Icon, title, ar, en, category }) => <button key={title} onClick={() => toast.info(isArabic ? "سيفتح سجل هذه الوحدة في النسخة التالية." : "This module record opens in the next iteration.")} className="surface-panel rounded-2xl p-5 text-right transition hover:-translate-y-0.5 hover:border-white/25"><Icon className="h-5 w-5 text-white/55" /><p className="mt-7 text-xl text-display">{title}</p><p className="mt-2 text-sm text-white/70">{recordCount(category)} {isArabic ? ar : en}</p><p className="mt-2 text-[11px] leading-5 text-white/40">{isArabic ? "سجل قابل للمراجعة، لا قرار آلي." : "Reviewable record, no automated decision."}</p></button>)}
    </div>
    <div className="rounded-2xl border border-amber-200/15 bg-amber-200/5 p-4 text-xs leading-6 text-amber-50/70"><ClipboardList className="mr-2 inline h-4 w-4" />{isArabic ? "المهام وسجلات CRM المحفوظة في المؤسسة تظهر هنا عند الاتصال. وضع سطح المكتب يحتفظ بمساره المحلي المشفّر." : "Institution-saved tasks and CRM records appear here when connected. Desktop mode keeps its encrypted local path."}</div>
  </div>;
}
