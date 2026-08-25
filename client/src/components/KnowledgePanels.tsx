import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { ParentPolicyChat } from "@/components/ParentPolicyChat";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, BookOpenCheck, ExternalLink, FileUp, Globe2, Loader2, LockKeyhole, MessageCircleQuestion, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

type SourceRef = { id: string; title: string; url: string | null };

function PanelTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <header className="mb-8"><p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">{eyebrow}</p><h2 className="text-display mt-3 text-4xl leading-none sm:text-5xl">{title}</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">{copy}</p></header>;
}

export function PublicKnowledgeAgent() {
  return <ParentPolicyChat />;
}

export function KnowledgeAdministration() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "staff">("public");
  const [webTitle, setWebTitle] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const canManage = isAuthenticated && user?.role === "admin";
  const sources = trpc.knowledge.listSources.useQuery(undefined, { enabled: canManage });
  const ingestText = trpc.knowledge.ingestText.useMutation({ onSuccess: () => { toast.success("تمت فهرسة المصدر المعتمد."); setTitle(""); setContent(""); utils.knowledge.listSources.invalidate(); }, onError: error => toast.error(error.message || "تعذر حفظ المصدر.") });
  const ingestUrl = trpc.knowledge.ingestUrl.useMutation({ onSuccess: () => { toast.success("تم استيراد الصفحة وفهرستها."); setWebTitle(""); setWebUrl(""); utils.knowledge.listSources.invalidate(); }, onError: error => toast.error(error.message || "تعذر استيراد الصفحة.") });

  const readyCount = useMemo(() => sources.data?.filter(source => source.status === "ready").length ?? 0, [sources.data]);

  if (loading) return <div className="flex min-h-[42vh] items-center justify-center text-white/60"><Loader2 className="ml-3 h-5 w-5 animate-spin" />جارٍ التحقق من الجلسة…</div>;
  if (!isAuthenticated) return <div className="mx-auto max-w-3xl"><PanelTitle eyebrow="Administrator access" title="مصادر المؤسسة تحت سيطرة الإدارة." copy="استيراد السياسات والكتيبات وصفحات المؤسسة محمي بحساب مدير المؤسسة. سجّل الدخول أولاً لحماية ما يراه أولياء الأمور والطلاب." /><article className="surface-panel rounded-2xl p-7"><LockKeyhole className="h-6 w-6 text-amber-100" /><p className="text-display mt-8 text-4xl">سجّل الدخول كمدير.</p><p className="mt-3 max-w-xl text-sm leading-7 text-white/55">بعد الدخول، يمكن للمدير المعيّن فقط إضافة مصدر، تحديد ظهوره للعام أو الموظفين، ومراجعة سجل المصادر المفهرسة.</p><button onClick={startLogin} className="liquid-glass mt-7 rounded-full px-6 py-3 text-sm">دخول الإدارة</button></article></div>;
  if (!canManage) return <div className="mx-auto max-w-3xl"><PanelTitle eyebrow="Restricted register" title="هذه المساحة لمدير المؤسسة." copy="حسابك لا يملك صلاحية إدارة المصادر. يمكنك استخدام مساعد EduPulse للأسئلة العامة أو طلب تعيينك مديراً من مالك المؤسسة." /><article className="border border-amber-100/20 bg-amber-100/[0.05] p-6"><AlertTriangle className="h-5 w-5 text-amber-100" /><p className="mt-4 text-sm leading-7 text-white/70">تقييد هذه المساحة يمنع إضافة معلومات غير معتمدة إلى إجابات أولياء الأمور والطلاب.</p></article></div>;

  const importText = (event: FormEvent) => { event.preventDefault(); if (content.trim().length < 60 || title.trim().length < 3) return toast.error("أضف عنواناً ونصاً مقروءاً لا يقل عن 60 حرفاً."); ingestText.mutate({ title: title.trim(), content: content.trim(), visibility, mimeType: "text/plain" }); };
  const importFile = async (file: File | undefined) => {
    if (!file) return;
    const allowed = /\.(txt|md|csv|html?|rtf)$/i.test(file.name) || file.type.startsWith("text/");
    if (!allowed) return toast.error("في البداية المدارة تُقبل ملفات النص فقط (.txt, .md, .csv, .html). ملفات PDF والصور تنتقل إلى عامل MinerU المخصص لاحقاً.");
    const text = await file.text();
    setTitle(file.name.replace(/\.[^.]+$/, "")); setContent(text); toast.success("تمت قراءة الملف محلياً. راجع النص ثم احفظه كمصدر معتمد.");
  };

  return <div className="mx-auto max-w-6xl">
    <PanelTitle eyebrow="Approved knowledge register" title="مصادر موثقة. إجابات مسؤولة." copy="أضف فقط ما تريد أن يستخدمه مساعد EduPulse: كتيبات المؤسسة، سياسات الحضور والرسوم، الجداول، المناهج، أسئلة القبول الشائعة، وصفحات المؤسسة العامة. لا ترفع سجلات طلاب فردية إلى مصدر عام." />
    <div className="mb-7 grid gap-4 sm:grid-cols-3"><article className="surface-panel rounded-2xl p-5"><p className="text-xs text-white/45">مصادر جاهزة</p><p className="text-display mt-5 text-5xl">{readyCount}</p></article><article className="surface-panel rounded-2xl p-5"><p className="text-xs text-white/45">مسار البداية</p><p className="mt-5 text-sm text-white/75">نصوص وصفحات عامة</p></article><article className="surface-panel rounded-2xl p-5"><p className="text-xs text-white/45">المسار التالي</p><p className="mt-5 text-sm text-white/75">MinerU + Crawl4AI + LightRAG</p></article></div>
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={importText} className="surface-panel rounded-2xl p-6"><div className="flex items-start justify-between"><div><p className="text-display text-3xl">استيراد مصدر نصي</p><p className="mt-1 text-xs text-white/45">ملف نصي أو محتوى تمت مراجعته.</p></div><FileUp className="h-5 w-5 text-white/55" /></div><label className="mt-6 block text-xs text-white/50">العنوان<input value={title} onChange={event => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="مثال: دليل ولي الأمر 2026" /></label><label className="mt-5 block text-xs text-white/50">النص المعتمد<textarea value={content} onChange={event => setContent(event.target.value)} className="mt-2 min-h-48 w-full rounded-xl border border-white/12 bg-white/5 p-3 text-sm leading-6 text-white outline-none focus:border-white/35" placeholder="الصق نص السياسة أو محتوى الدليل هنا…" /></label><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="rounded-full border border-white/12 px-3 py-2 text-xs text-white/65 hover:border-white/30">اختيار ملف نصي<input type="file" accept=".txt,.md,.csv,.html,.htm,.rtf,text/*" className="sr-only" onChange={event => importFile(event.target.files?.[0])} /></label><label className="flex items-center gap-2 text-xs text-white/60"><input checked={visibility === "public"} onChange={event => setVisibility(event.target.checked ? "public" : "staff")} type="checkbox" className="accent-white" />متاح للمساعد العام</label></div><button disabled={ingestText.isPending} className="liquid-glass mt-6 rounded-full px-5 py-3 text-sm disabled:opacity-50">{ingestText.isPending && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}فهرسة المصدر المعتمد</button></form>
      <form onSubmit={event => { event.preventDefault(); if (!webTitle.trim() || !webUrl.trim()) return toast.error("أضف عنواناً ورابطاً عاماً."); ingestUrl.mutate({ title: webTitle.trim(), url: webUrl.trim(), visibility }); }} className="surface-panel rounded-2xl p-6"><div className="flex items-start justify-between"><div><p className="text-display text-3xl">استيراد صفحة معتمدة</p><p className="mt-1 text-xs text-white/45">صفحة عامة واحدة في كل مرة.</p></div><Globe2 className="h-5 w-5 text-white/55" /></div><label className="mt-6 block text-xs text-white/50">عنوان المصدر<input value={webTitle} onChange={event => setWebTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="مثال: صفحة البرامج" /></label><label className="mt-5 block text-xs text-white/50">الرابط العام<input value={webUrl} onChange={event => setWebUrl(event.target.value)} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="https://school.example/programmes" /></label><div className="mt-6 border-y border-white/10 py-4 text-xs leading-6 text-white/50">تستورد البداية المدارة النص المقروء من صفحة عامة. لا تُستخدم صفحات الدخول، العناوين الداخلية، أو مواقع لا تملك المؤسسة حق استخدامها.</div><button disabled={ingestUrl.isPending} className="liquid-glass mt-6 rounded-full px-5 py-3 text-sm disabled:opacity-50">{ingestUrl.isPending && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}استيراد وفهرسة الصفحة</button></form>
    </div>
    <section className="mt-8 surface-panel overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/10 px-6 py-5"><div><p className="text-display text-3xl">سجل المصادر</p><p className="mt-1 text-xs text-white/45">كل إجابة تشير إلى المصدر الذي يدعمها.</p></div><BookOpenCheck className="h-5 w-5 text-white/45" /></div>{sources.isLoading ? <div className="p-8 text-sm text-white/50">تحميل السجل…</div> : sources.data?.length ? <div className="divide-y divide-white/8">{sources.data.map(source => <div key={source.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{source.title}</p><p className="mt-1 text-xs text-white/45">{source.kind === "webpage" ? "صفحة ويب" : "مستند"} · {source.visibility === "public" ? "متاح للمساعد العام" : "للموظفين فقط"}</p></div><span className="rounded-full border border-emerald-100/20 bg-emerald-100/10 px-3 py-1.5 text-xs text-emerald-100">جاهز</span></div>)}</div> : <div className="p-8 text-sm leading-7 text-white/50">لا توجد مصادر بعد. ابدأ بسياسة حضور أو دليل ولي أمر تمت مراجعته.</div>}</section>
  </div>;
}
