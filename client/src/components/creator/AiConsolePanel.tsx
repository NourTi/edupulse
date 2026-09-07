/**
 * EduPulse AI console — the interior workspace surface for the free public data
 * layer and the deterministic tool planner.
 *
 * Boundaries that must stay true (inherited from the agent rules in server/knowledge):
 *  - public data only: the browser sends a question, never a learner record;
 *  - every answer carries the public source that produced it, or an explicit
 *    "no answer" notice — the console never fills a gap with invented text;
 *  - institution knowledge and policy questions belong to the grounded assistant,
 *    not to this console;
 *  - a Venice polish is opt-in and can only rephrase the verified answer.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, LockKeyhole, Send, Sparkles, WifiOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Turn = { id: number; question: string; answer: string; tool: string; sources: Array<{ title: string; url: string; citation: string }>; polish: string };

const SUGGESTIONS = [
  "what is the weather in Ghardaia before the mock exam week",
  "find research papers about formative assessment in secondary English",
  "books on classroom differentiation",
  "check github repo zijinz456/OpenTutor before we vendor ideas",
  "price of bitcoin and ethereum in USD",
];

const TOOL_LABELS: Record<string, string> = {
  weather: "Open-Meteo",
  crypto: "CoinGecko",
  github: "GitHub",
  research: "ERIC",
  books: "Open Library",
  chat: "needs the grounded assistant",
  needs_input: "clarification",
};

export default function AiConsolePanel() {
  const [draft, setDraft] = useState(SUGGESTIONS[0]);
  const [polish, setPolish] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const status = trpc.knowledge.freeSourceStatus.useQuery();
  const run = trpc.knowledge.runFreeSource.useMutation();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length]);

  const health = useMemo(() => status.data?.sources ?? [], [status.data]);

  const send = (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length < 3 || run.isPending) return;
    run.mutate({ message: trimmed, polish }, {
      onSuccess: result => {
        setTurns(current => [...current, { id: current.length + 1, question: trimmed, answer: result.answer, tool: result.tool, sources: result.sources, polish: result.polish }]);
        setDraft("");
      },
      onError: error => {
        setTurns(current => [...current, { id: current.length + 1, question: trimmed, answer: `The console could not run safely (${error.message.slice(0, 140)}). Nothing was invented to fill the gap.`, tool: "error", sources: [], polish: "local" }]);
      },
    });
  };

  return (
    <div className="space-y-5">
      <Card className="ws-panel">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-3 text-base">
            Free public sources
            <Badge variant="outline">{status.data?.venice.configured ? "Venice polish ready" : "Rubric mode — no model configured"}</Badge>
            {status.data?.crawled ? <Badge variant="secondary">Crawl4AI gateway</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="ws-strip">
            {health.map(source => (
              <div key={source.id}>
                <p className="ws-status text-xs" data-state={source.configured ? "live" : "off"}>{source.label}</p>
                <p className="mt-2 text-[11px] leading-5 text-white/45">{source.note}</p>
              </div>
            ))}
            {!health.length && <p className="text-xs text-white/45">Reading source health…</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(suggestion => (
              <button key={suggestion} type="button" className="ws-chip transition hover:border-white/35 hover:text-white" onClick={() => setDraft(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="ws-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-[hsl(187_78%_63%)]" /> Console
            <span className="ws-chip ml-auto">deterministic planner → public source → cited answer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={listRef} className="max-h-[46vh] space-y-3 overflow-y-auto pe-1">
            {!turns.length && (
              <div className="ws-row p-4 text-xs leading-6 text-white/55">
                Ask for campus weather before an exam week, education-research records for a seminar, library titles, or the public health of a repository. The planner routes the request;
                the answer carries its source. Learner records, grades, attendance and fees stay outside this surface — the grounded assistant answers approved school knowledge instead.
              </div>
            )}
            {turns.map(turn => (
              <article key={turn.id} className="space-y-2">
                <p className="text-xs text-white/45">{turn.question}</p>
                <div className="ws-row p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    <span>{TOOL_LABELS[turn.tool] ?? turn.tool}</span>
                    {turn.polish === "venice" && <span className="text-[hsl(45_92%_68%)]">model-rephrased</span>}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-white/85">{turn.answer}</p>
                  {!!turn.sources.length && (
                    <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
                      {turn.sources.map(source => (
                        <li key={source.url} className="text-[11px] text-white/50">
                          <a className="underline decoration-white/25 underline-offset-4 hover:text-white" href={source.url} target="_blank" rel="noreferrer noopener">
                            {source.title}
                          </a>{" "}
                          — {source.citation}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
            {run.isPending && (
              <div className="ws-row flex items-center gap-2 p-3 text-xs text-white/55">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> querying the public source…
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Textarea value={draft} onChange={event => setDraft(event.target.value)} rows={2} placeholder="Ask the console — public data only…" className="resize-none" />
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled={run.isPending || draft.trim().length < 3} onClick={() => send(draft)} className="gap-2">
                {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Run
              </Button>
              <label className="flex items-center gap-2 text-xs text-white/55">
                <Switch checked={polish} onCheckedChange={checked => setPolish(Boolean(checked))} disabled={!status.data?.venice.configured} />
                Arabic/summary polish via Venice
              </label>
              {!status.data?.venice.configured && <span className="ws-chip"><WifiOff className="h-3 w-3" /> model off — rubric answers only</span>}
              <span className="ws-chip ms-auto"><LockKeyhole className="h-3 w-3" /> no learner data leaves EduPulse</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
