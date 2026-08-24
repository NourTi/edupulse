import { ArrowLeft, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

export type LocalSearchResult = {
  type: "student" | "payment";
  id: string;
  title: string;
  meta: string;
  destination: string;
};

export function LocalSearchOverlay({ query, results, onQueryChange, onClose, onSelect }: { query: string; results: LocalSearchResult[]; onQueryChange: (query: string) => void; onClose: () => void; onSelect: (destination: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return <main className="min-h-screen bg-[hsl(201_100%_13%)] px-5 py-5 text-white sm:px-8 sm:py-7" dir="rtl"><div className="mx-auto max-w-4xl"><header className="mb-12 flex items-center justify-between"><button onClick={onClose} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/70 transition hover:bg-white/6 hover:text-white"><ArrowLeft className="h-4 w-4" />العودة إلى السجل</button><span className="text-display text-3xl">EduPulse</span></header><section className="surface-panel rounded-2xl p-5 sm:p-7"><div className="flex items-center gap-3 border-b border-white/10 pb-4"><Search className="h-5 w-5 text-white/55" /><input ref={inputRef} value={query} onChange={event => onQueryChange(event.target.value)} placeholder="ابحث باسم الطالب، ولي الأمر، المادة، المستوى أو رقم الإيصال…" className="min-w-0 flex-1 bg-transparent py-2 text-base text-white outline-none placeholder:text-white/35" /><button onClick={onClose} className="rounded-full p-2 text-white/50 hover:bg-white/7 hover:text-white" aria-label="إغلاق البحث"><X className="h-4 w-4" /></button></div><p className="pt-4 text-xs text-white/45">بحث محلي في سجل EduPulse الحالي. لا تُرسل عبارة البحث إلى أي خدمة خارجية.</p><div className="mt-5 divide-y divide-white/8">{query.trim() ? results.length ? results.map(result => <button key={`${result.type}-${result.id}`} onClick={() => onSelect(result.destination)} className="flex w-full items-start justify-between gap-4 px-3 py-4 text-right transition hover:bg-white/6"><div><p className="text-sm font-medium">{result.title}</p><p className="mt-1 text-xs text-white/50">{result.meta}</p></div><span className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] text-white/55">{result.type === "student" ? "طالب" : "إيصال"}</span></button>) : <div className="px-3 py-14 text-center text-sm text-white/50">لا توجد نتائج في السجل المحلي.</div> : <div className="px-3 py-14 text-center text-sm text-white/50">اكتب للبحث في الطلاب وأولياء الأمور والمواد والإيصالات.</div>}</div></section></div></main>;
}
