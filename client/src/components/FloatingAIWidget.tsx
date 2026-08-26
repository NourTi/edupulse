import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Bot, ExternalLink, MessageCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SourceRef = { id: string; title: string; url: string | null };

const suggestedPrompts = [
  "ما هي مراحل التعليم في الجزائر؟",
  "ما هي برامج EduPulse؟",
  "كيف يمكنني التواصل مع الإدارة؟",
];

export function FloatingAIWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<SourceRef[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const ask = trpc.knowledge.askPublic.useMutation({
    onSuccess: result => {
      setMessages(current => [...current, { role: "assistant", content: result.answer }]);
      setSources(result.sources);
    },
    onError: error => {
      setMessages(current => [...current, { role: "assistant", content: "تعذر الوصول إلى المساعد الآن. حاول مرة أخرى بعد لحظات." }]);
      toast.error(error.message || "تعذر الوصول إلى المساعد الآن.");
    },
  });

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  const sendQuestion = (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length < 3 || ask.isPending) return;
    setMessages(current => [...current, { role: "user", content: trimmed }]);
    setSources([]);
    ask.mutate({ question: trimmed });
  };

  return <>
    {open && <div className="fixed inset-0 z-40 bg-[#001b2a]/20 backdrop-blur-[2px] sm:hidden" aria-hidden="true" onClick={() => setOpen(false)} />}
    {open && <section className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(680px,calc(100vh-7rem))] flex-col overflow-hidden rounded-[1.35rem] border border-cyan-100/20 bg-[#06283a]/95 text-white shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:inset-x-auto sm:bottom-28 sm:right-7 sm:w-[min(410px,calc(100vw-2rem))]" dir="rtl" role="dialog" aria-modal="false" aria-labelledby="floating-agent-title">
      <header className="flex items-center justify-between border-b border-white/10 bg-gradient-to-l from-cyan-300/10 to-transparent px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300/15 text-cyan-100"><Bot className="h-5 w-5" /></div>
          <div className="min-w-0"><p id="floating-agent-title" className="truncate text-sm font-semibold text-white">مساعد EduPulse</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-cyan-100/65"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> متاح للزوار · مصادر موثوقة</p></div>
        </div>
        <button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-200/70" aria-label="إغلاق المساعد"><X className="h-4 w-4" /></button>
      </header>
      <div className="border-b border-white/8 bg-white/[0.025] px-4 py-3 text-xs leading-5 text-white/65"><div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" /><span>اسأل عن EduPulse أو معلومات عامة. لا يرى المساعد سجلات الطلاب الخاصة.</span></div></div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2"><AIChatBox messages={messages} onSendMessage={sendQuestion} isLoading={ask.isPending} placeholder="اكتب سؤالك هنا…" height="360px" emptyStateMessage="كيف أساعدك اليوم؟" suggestedPrompts={suggestedPrompts} className="rounded-xl border-0 bg-transparent shadow-none" /></div>
      {sources.length > 0 && <div className="max-h-24 overflow-y-auto border-t border-white/10 px-4 py-3"><p className="text-[11px] text-white/45">مصدر الإجابة</p><div className="mt-2 flex flex-wrap gap-1.5">{sources.map((source, index) => <a key={`${source.id}-${index}`} href={source.url ?? undefined} target={source.url ? "_blank" : undefined} rel="noreferrer" className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/12 px-2.5 py-1 text-[10px] text-white/65 transition hover:border-cyan-100/35 hover:text-white">[{source.id === "wikipedia" ? "W1" : `S${index + 1}`}] <span className="truncate">{source.title}</span>{source.url && <ExternalLink className="h-3 w-3 shrink-0" />}</a>)}</div></div>}
    </section>}
    <button type="button" onClick={() => setOpen(current => !current)} className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-cyan-100/25 bg-[#06283a]/92 px-3 py-2.5 text-right text-white shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-100/50 focus:outline-none focus:ring-2 focus:ring-cyan-200/80 sm:bottom-7 sm:right-7" aria-expanded={open} aria-controls="floating-agent-title"><span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan-200 to-sky-400 text-[#043149]"><MessageCircle className="h-5 w-5" /><span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#06283a] bg-emerald-300" /></span><span className="hidden sm:block"><span className="flex items-center gap-1 text-xs font-semibold">اسأل EduPulse <Sparkles className="h-3 w-3 text-amber-200" /></span><span className="mt-0.5 block text-[10px] text-white/50">مساعد الزوار</span></span><span className="sr-only">{open ? "إغلاق مساعد EduPulse" : "فتح مساعد EduPulse"}</span></button>
  </>;
}
