import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { ExternalLink, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SourceRef = { id: string; title: string; url: string | null };

const suggestedPrompts = [
  "ما هي برامج اللغة الإنجليزية المتاحة؟",
  "ما هي سياسة الحضور والغياب؟",
  "كيف يمكنني التواصل مع الإدارة؟",
  "ما هي مواعيد التسجيل الجديدة؟",
];

export function ParentPolicyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<SourceRef[]>([]);
  const ask = trpc.knowledge.askPublic.useMutation({
    onSuccess: result => {
      setMessages(current => [...current, { role: "assistant", content: result.answer }]);
      setSources(result.sources);
    },
    onError: error => {
      setMessages(current => [...current, { role: "assistant", content: "تعذر الوصول إلى دليل المؤسسة الآن. حاول مرة أخرى أو تواصل مع الإدارة مباشرة." }]);
      toast.error(error.message || "تعذر الوصول إلى دليل المؤسسة الآن.");
    },
  });

  const sendQuestion = (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length < 3 || ask.isPending) return;
    setMessages(current => [...current, { role: "user", content: trimmed }]);
    setSources([]);
    ask.mutate({ question: trimmed });
  };

  return <div className="mx-auto max-w-6xl" dir="rtl">
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">EduPulse · مساعد الزوار</p>
        <p className="mt-3 border border-cyan-100/15 bg-cyan-100/[0.04] px-3 py-2 text-xs leading-6 text-cyan-50/80">يمكن لأي زائر طرح سؤال عام. يجيب المساعد من المصادر العامة المعتمدة فقط، ولا يرى سجلات الطلاب أو بيانات المؤسسات الخاصة.</p>
        <h2 className="text-display mt-3 text-4xl leading-none sm:text-5xl">اسأل بثقة.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">اسأل عن البرامج، المواعيد، التسجيل، أو السياسات العامة. يجيب المساعد من المعلومات العامة التي اعتمدتها الإدارة فقط.</p>
      </div>
      <div className="flex items-center gap-2 border border-emerald-100/15 bg-emerald-100/[0.05] px-4 py-3 text-xs text-emerald-100"><ShieldCheck className="h-4 w-4" /> مصادر معتمدة فقط</div>
    </header>
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <section className="surface-panel overflow-hidden rounded-2xl p-1">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8"><MessageCircleQuestion className="h-4 w-4 text-amber-100" /></div><div><p className="text-sm text-white/85">محادثة دليل المؤسسة</p><p className="text-xs text-white/40">الإجابة لا تعرض سجلات طالب فردية</p></div></div>
        <AIChatBox messages={messages} onSendMessage={sendQuestion} isLoading={ask.isPending} placeholder="اكتب سؤالك عن المدرسة أو البرنامج…" height="520px" emptyStateMessage="كيف يمكننا مساعدتك؟" suggestedPrompts={suggestedPrompts} className="rounded-xl border-0 bg-transparent shadow-none" />
        {sources.length > 0 && <div className="mx-4 mb-4 border-t border-white/10 px-2 pt-4"><p className="text-xs text-white/45">المصادر التي دعمت آخر إجابة</p><div className="mt-3 flex flex-wrap gap-2">{sources.map((source, index) => <a key={`${source.id}-${index}`} href={source.url ?? undefined} target={source.url ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-1.5 border border-white/12 px-3 py-2 text-xs text-white/65 transition hover:border-white/30 hover:text-white">[S{index + 1}] {source.title}{source.url && <ExternalLink className="h-3 w-3" />}</a>)}</div></div>}
      </section>
      <aside className="space-y-4">
        <article className="border border-white/10 p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/40">كيف تسأل؟</p><p className="text-display mt-5 text-3xl">سؤال واحد، إجابة واضحة.</p><p className="mt-3 text-sm leading-7 text-white/55">استخدم لغة بسيطة. إذا لم توجد الإجابة في دليل المؤسسة، سيقول المساعد ذلك بدلاً من التخمين.</p></article>
        <article className="border border-amber-100/15 bg-amber-100/[0.04] p-5"><p className="text-sm text-amber-50">لأسئلة حسابك</p><p className="mt-2 text-sm leading-7 text-white/55">لا يجيب هذا المساعد العام عن الدرجات أو الحضور الفردي أو الرسوم الخاصة بك. استخدم بوابة ولي الأمر أو تواصل مع الإدارة.</p></article>
      </aside>
    </div>
  </div>;
}
