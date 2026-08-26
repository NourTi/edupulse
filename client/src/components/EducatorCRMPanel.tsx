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
  const createRecordMutation = trpc.records.createEducatorRecord.useMutation();
  const updateRecordMutation = trpc.records.updateEducatorRecord.useMutation();
  const archiveRecordMutation = trpc.records.archiveEducatorRecord.useMutation();
  const serverRecordsQuery = trpc.records.educatorRecords.useQuery(undefined, { enabled: Boolean(user) && !desktopRuntime, retry: false });
  const learnersQuery = trpc.records.learners.useQuery(undefined, { enabled: Boolean(user) && !desktopRuntime, retry: false });
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "essay" | "behavior" | "mentorship" | "resource" | "language_evolution" | "client">("all");
  const [recordForm, setRecordForm] = useState({ category: "essay" as "essay" | "behavior" | "mentorship" | "resource" | "language_evolution" | "client", learnerId: "", title: "", summary: "", stage: "", score: "" });
  const recordCount = (category: "essay" | "behavior" | "mentorship" | "resource" | "language_evolution" | "client") => serverRecordsQuery.data?.filter(record => record.category === category).length ?? 0;
  const essayCount = (stage: string, fallback: string) => serverRecordsQuery.isSuccess ? String(serverRecordsQuery.data.filter(record => record.category === "essay" && record.stage === stage).length) : fallback;
  const categoryRecords = serverRecordsQuery.data?.filter(record => activeCategory === "all" || record.category === activeCategory) ?? [];
  const moduleHint = (category: typeof recordForm.category) => ({ essay: isArabic ? "المرحلة: فكرة، مسودة، مراجعة، اعتماد." : "Stages: idea, draft, review, approved.", behavior: isArabic ? "سجل واقعة قابلة للمراجعة وخطوة المتابعة." : "Capture the observable event and the follow-up step.", mentorship: isArabic ? "وثّق الجلسة والهدف والخطوة التالية." : "Document the session, goal, and next step.", resource: isArabic ? "أضف نوع المورد ورابطه أو وصف استخدامه." : "Add the resource type and how it is used.", language_evolution: isArabic ? "سجل المهارة، الدليل، ونقطة التقدم." : "Capture the skill, evidence, and progress milestone.", client: isArabic ? "حدد حالة العميل والخطوة التجارية التالية." : "Set the client status and next business step." }[category]);
  const stageOptions = { essay: ["idea", "draft", "review", "approved"], behavior: ["observed", "follow_up", "resolved"], mentorship: ["planned", "held", "next_step"], resource: ["draft", "approved", "retired"], language_evolution: ["baseline", "milestone", "review"], client: ["lead", "active", "renewal", "closed"] }[recordForm.category];

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
  const addRecord = () => {
    if (!recordForm.title.trim() || !recordForm.summary.trim()) {
      toast.error(isArabic ? "أدخل عنوان السجل وملخصه." : "Enter a record title and summary.");
      return;
    }
    if (!user || desktopRuntime) {
      toast.info(isArabic ? "يحفظ هذا السجل في النسخة المتصلة فقط." : "This record is saved in connected mode only.");
      return;
    }
    const onSuccess = () => { setEditingRecordId(null); setRecordForm(current => ({ ...current, learnerId: "", title: "", summary: "", stage: "", score: "" })); void serverRecordsQuery.refetch(); toast.success(isArabic ? "تم حفظ سجل CRM." : "CRM record saved."); };
    if (editingRecordId) updateRecordMutation.mutate({ recordId: editingRecordId, learnerId: recordForm.learnerId || undefined, title: recordForm.title, summary: recordForm.summary, stage: recordForm.stage || undefined, score: recordForm.score ? Number(recordForm.score) : undefined }, { onSuccess, onError: () => toast.error(isArabic ? "تعذر تحديث سجل CRM." : "Could not update CRM record.") });
    else createRecordMutation.mutate({ ...recordForm, score: recordForm.score ? Number(recordForm.score) : undefined }, { onSuccess, onError: () => toast.error(isArabic ? "تعذر حفظ سجل CRM." : "Could not save CRM record.") });
  };

  const beginEdit = (record: NonNullable<typeof serverRecordsQuery.data>[number]) => {
    setEditingRecordId(record.id);
    setRecordForm({ category: record.category, learnerId: record.learnerId ?? "", title: record.title, summary: record.summary, stage: record.stage ?? "", score: record.score == null ? "" : String(record.score) });
  };

  const archiveRecord = (recordId: string) => {
    if (desktopRuntime || !user) return;
    archiveRecordMutation.mutate({ recordId }, { onSuccess: () => { if (editingRecordId === recordId) setEditingRecordId(null); void serverRecordsQuery.refetch(); toast.success(isArabic ? "تمت أرشفة السجل." : "Record archived."); }, onError: () => toast.error(isArabic ? "تعذر أرشفة السجل." : "Could not archive record.") });
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
      {[{ icon: HeartHandshake, title: labels.mentoring, ar: "جلسات موثقة", en: "documented sessions", category: "mentorship" as const }, { icon: MessageSquareText, title: labels.behavior, ar: "سجلات مشاركة", en: "participation records", category: "behavior" as const }, { icon: Library, title: labels.resources, ar: "موارد معتمدة", en: "approved resources", category: "resource" as const }, { icon: TrendingUp, title: labels.evolution, ar: "سجلات تطور", en: "evolution records", category: "language_evolution" as const }].map(({ icon: Icon, title, ar, en, category }) => <button key={title} onClick={() => { setActiveCategory(category); setRecordForm(current => ({ ...current, category })); }}
 className="surface-panel rounded-2xl p-5 text-right transition hover:-translate-y-0.5 hover:border-white/25"><Icon className="h-5 w-5 text-white/55" /><p className="mt-7 text-xl text-display">{title}</p><p className="mt-2 text-sm text-white/70">{recordCount(category)} {isArabic ? ar : en}</p><p className="mt-2 text-[11px] leading-5 text-white/40">{isArabic ? "سجل قابل للمراجعة، لا قرار آلي." : "Reviewable record, no automated decision."}</p></button>)}
    </div>
    <article className="surface-panel rounded-2xl p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-display text-2xl">{isArabic ? "إضافة سجل تربوي" : "Add educator record"}</p><p className="mt-1 text-xs text-white/45">{moduleHint(recordForm.category)}</p></div><ClipboardList className="h-5 w-5 text-white/45" /></div><div className="mt-5 grid gap-3 md:grid-cols-2"><select value={recordForm.category} onChange={event => setRecordForm(current => ({ ...current, category: event.target.value as typeof current.category }))} className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"><option value="essay">{isArabic ? "مسار المقالات" : "Essay pipeline"}</option><option value="behavior">{isArabic ? "السلوك والمشاركة" : "Behaviour"}</option><option value="mentorship">{isArabic ? "الإرشاد" : "Mentorship"}</option><option value="resource">{isArabic ? "مورد تعليمي" : "Resource"}</option><option value="language_evolution">{isArabic ? "تطور اللغة" : "Language evolution"}</option><option value="client">{isArabic ? "إدارة عميل" : "Client management"}</option></select><select value={recordForm.learnerId} onChange={event => setRecordForm(current => ({ ...current, learnerId: event.target.value }))} className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"><option value="">{isArabic ? "اربط بالطالب (اختياري)" : "Link learner (optional)"}</option>{learnersQuery.data?.map(learner => <option key={learner.id} value={learner.id}>{learner.nameAr} · {learner.grade}</option>)}</select><select value={recordForm.stage} onChange={event => setRecordForm(current => ({ ...current, stage: event.target.value }))} className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"><option value="">{isArabic ? "اختر المرحلة أو الحالة" : "Choose stage or status"}</option>{stageOptions.map(stage => <option key={stage} value={stage}>{stage}</option>)}</select><input value={recordForm.score} onChange={event => setRecordForm(current => ({ ...current, score: event.target.value.replace(/[^0-9]/g, "").slice(0, 3) }))} inputMode="numeric" placeholder={isArabic ? "درجة أو شدة (اختياري)" : "Score or severity (optional)"} className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35" /><input value={recordForm.title} onChange={event => setRecordForm(current => ({ ...current, title: event.target.value }))} placeholder={isArabic ? "عنوان السجل" : "Record title"} className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35 md:col-span-2" /><textarea value={recordForm.summary} onChange={event => setRecordForm(current => ({ ...current, summary: event.target.value }))} placeholder={isArabic ? "الدليل أو الملخص" : "Evidence or summary"} className="min-h-24 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35 md:col-span-2" /><button onClick={addRecord} disabled={createRecordMutation.isPending || updateRecordMutation.isPending} className="liquid-glass rounded-xl px-4 py-2 text-sm md:col-span-2">{createRecordMutation.isPending || updateRecordMutation.isPending ? (isArabic ? "جارٍ الحفظ…" : "Saving…") : (editingRecordId ? (isArabic ? "تحديث السجل" : "Update record") : (isArabic ? "حفظ السجل" : "Save record"))}</button></div>{editingRecordId && <button onClick={() => { setEditingRecordId(null); setRecordForm(current => ({ ...current, title: "", summary: "", stage: "" })); }} className="mt-3 text-xs text-white/50 hover:text-white">{isArabic ? "إلغاء التعديل" : "Cancel editing"}</button>}</article>
    {serverRecordsQuery.isLoading && <article className="surface-panel rounded-2xl p-5 text-sm text-white/55">{isArabic ? "جارٍ تحميل سجلات CRM…" : "Loading CRM records…"}</article>}{serverRecordsQuery.isError && <article className="surface-panel rounded-2xl p-5 text-sm text-rose-100/75">{isArabic ? "تعذر تحميل سجلات CRM. تحقق من الاتصال والصلاحية." : "CRM records could not be loaded. Check connection and access."}</article>}{serverRecordsQuery.isSuccess && <article className="surface-panel rounded-2xl p-5"><div className="flex items-center justify-between gap-3"><p className="text-display text-2xl">{isArabic ? "السجلات المحفوظة" : "Saved records"}</p><select value={activeCategory} onChange={event => setActiveCategory(event.target.value as typeof activeCategory)} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white"><option value="all">{isArabic ? "كل الوحدات" : "All modules"}</option><option value="essay">{isArabic ? "المقالات" : "Essays"}</option><option value="behavior">{isArabic ? "السلوك" : "Behaviour"}</option><option value="mentorship">{isArabic ? "الإرشاد" : "Mentorship"}</option><option value="resource">{isArabic ? "الموارد" : "Resources"}</option><option value="language_evolution">{isArabic ? "تطور اللغة" : "Language"}</option><option value="client">{isArabic ? "العملاء" : "Clients"}</option></select></div>{categoryRecords.length === 0 ? <p className="mt-4 text-sm text-white/45">{isArabic ? "لا توجد سجلات في هذه الوحدة بعد." : "No records in this module yet."}</p> : <div className="mt-4 space-y-2">{categoryRecords.map(record => <div key={record.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm text-white/85">{record.title}</p><p className="mt-1 text-xs text-white/40">{record.category} · {record.stage ?? (isArabic ? "بدون مرحلة" : "No stage")}{record.learnerId ? ` · ${learnersQuery.data?.find(learner => learner.id === record.learnerId)?.nameAr ?? record.learnerId}` : ""}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => beginEdit(record)} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/60 hover:text-white">{isArabic ? "تعديل" : "Edit"}</button><button onClick={() => archiveRecord(record.id)} disabled={archiveRecordMutation.isPending} className="rounded-lg border border-rose-200/15 px-2 py-1 text-xs text-rose-100/70 hover:text-rose-50">{isArabic ? "أرشفة" : "Archive"}</button></div></div>)}</div>}</article>}
    <div className="rounded-2xl border border-amber-200/15 bg-amber-200/5 p-4 text-xs leading-6 text-amber-50/70">{isArabic ? "المهام وسجلات CRM المحفوظة في المؤسسة تظهر هنا عند الاتصال. وضع سطح المكتب يحتفظ بمساره المحلي المشفّر." : "Institution-saved tasks and CRM records appear here when connected. Desktop mode keeps its encrypted local path."}</div>
  </div>;
}
