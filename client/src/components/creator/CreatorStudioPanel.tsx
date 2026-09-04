import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Helpers ──
function useInstitutionId() {
  const { data: memberships } = trpc.auth.myMemberships.useQuery();
  return (memberships?.[0]?.membership.institutionId as string | undefined);
}

// ── Kanban (Studyield promotion engine + feifei pipeline) ──
function EnquiriesKanban({ institutionId }: { institutionId?: string }) {
  const utils = trpc.useUtils();
  const { data: enquiries, isLoading } = trpc.creator.listEnquiries.useQuery(institutionId ? { institutionId } : undefined);
  const create = trpc.creator.createEnquiry.useMutation({ onSuccess: () => utils.creator.listEnquiries.invalidate() });
  const move = trpc.creator.moveEnquiry.useMutation({ onSuccess: () => utils.creator.listEnquiries.invalidate() });
  const [form, setForm] = useState({ name: "", phone: "", stage: "3AS" });
  const columns: Array<{ key: string; label: string }> = [
    { key: "new", label: "New Lead" }, { key: "test_scheduled", label: "Test Scheduled" }, { key: "evaluated", label: "Evaluated" },
    { key: "trial", label: "Trial" }, { key: "offer", label: "Offer" }, { key: "enrolled", label: "Enrolled" },
  ];
  return (
    <Card className="border-2">
      <CardHeader><CardTitle className="flex items-center gap-2">🎯 Admissions Kanban — Growth Engine <Badge variant="secondary">{enquiries?.length ?? 0} leads</Badge></CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="Name / الاسم" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="max-w-[180px]" />
          <Input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="max-w-[150px]" />
          <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1AS">1AS</SelectItem><SelectItem value="2AS">2AS</SelectItem><SelectItem value="3AS">3AS</SelectItem><SelectItem value="M1">M1</SelectItem><SelectItem value="M2">M2</SelectItem></SelectContent></Select>
          <Button disabled={!form.name} onClick={() => create.mutate({ institutionId, name: form.name, phone: form.phone, stage: form.stage, status: "new" })}>+ New Lead</Button>
        </div>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {columns.map(col => (
              <div key={col.key} className="rounded-lg border bg-white min-h-[220px] p-2">
                <div className="font-semibold text-xs uppercase tracking-wide border-b pb-1 mb-2">{col.label} <span className="text-muted-foreground">({enquiries?.filter(e => e.status === col.key).length ?? 0})</span></div>
                <div className="space-y-2">
                  {(enquiries ?? []).filter(e => e.status === col.key).map(enq => (
                    <div key={enq.id} className="rounded border p-2 bg-zinc-50 text-xs">
                      <div className="font-medium">{enq.name}</div>
                      <div className="text-muted-foreground">{enq.phone ?? ""} · {enq.stage ?? ""}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {columns.filter(c => c.key !== col.key).slice(0, 2).map(n => (
                          <Button key={n.key} size="sm" variant="outline" className="h-6 text-[10px] px-1" onClick={() => move.mutate({ institutionId, id: enq.id, status: n.key as any })}>{n.label} →</Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Cohorts (M3) ──
function CohortsBlock({ institutionId }: { institutionId?: string }) {
  const utils = trpc.useUtils();
  const { data: cohorts } = trpc.creator.listCohorts.useQuery(institutionId ? { institutionId } : undefined);
  const create = trpc.creator.createCohort.useMutation({ onSuccess: () => utils.creator.listCohorts.invalidate() });
  const [form, setForm] = useState({ nameAr: "فوج 3AS Ética", nameEn: "3AS Ethics", stage: "3AS", taughtLanguage: "en" as const });
  return (
    <Card>
      <CardHeader><CardTitle>👥 Cohorts — Tailor per Stream <Badge variant="outline">CEFR only English</Badge></CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} className="max-w-[200px]" placeholder="Name Ar" />
          <Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="max-w-[200px]" placeholder="Name En" />
          <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}><SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2AS">2AS</SelectItem><SelectItem value="3AS">3AS</SelectItem><SelectItem value="M1">M1</SelectItem><SelectItem value="M2">M2</SelectItem></SelectContent></Select>
          <Select value={form.taughtLanguage} onValueChange={v => setForm({ ...form, taughtLanguage: v as any })}><SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ar">AR</SelectItem><SelectItem value="fr">FR</SelectItem><SelectItem value="en">EN · CEFR</SelectItem></SelectContent></Select>
          <Button onClick={() => create.mutate({ institutionId, ...form, taughtLanguage: form.taughtLanguage })}>+ Create Cohort</Button>
        </div>
        <div className="grid md:grid-cols-3 gap-2">
          {(cohorts ?? []).map(c => (
            <div key={c.id} className="border rounded p-3 bg-white">
              <div className="font-semibold">{c.nameEn} <span className="text-muted-foreground text-xs">({c.nameAr})</span></div>
              <div className="text-xs flex gap-2 mt-1"><Badge>{c.stage}</Badge><Badge variant={c.taughtLanguage === "en" ? "default" : "secondary"}>{c.taughtLanguage.toUpperCase()}</Badge><span className="text-muted-foreground">cap {c.capacity}</span></div>
            </div>
          ))}
          {(!cohorts || cohorts.length === 0) && <p className="text-sm text-muted-foreground col-span-3">No cohorts yet — create 3AS Ethics (en) to enable CEFR + Speaking Studio.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Knowledge Graph (LOOM + Studyield graph) ──
function KnowledgeGraphBlock() {
  const { data: nodes } = trpc.creator.listGraphNodes.useQuery({});
  const { data: edges } = trpc.creator.listGraphEdges.useQuery();
  const [stage, setStage] = useState<string>("3AS");
  const filtered = (nodes ?? []).filter(n => !stage || n.stage === stage);
  return (
    <Card>
      <CardHeader><CardTitle className="flex gap-2 items-center">🕸️ Knowledge Graph — Algeria Curriculum (LOOM) <Badge variant="outline">{filtered.length} nodes</Badge></CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select value={stage} onValueChange={setStage}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3AS">3AS</SelectItem><SelectItem value="2AS">2AS</SelectItem><SelectItem value="L1">L1</SelectItem><SelectItem value="M1">M1</SelectItem></SelectContent></Select>
          <span className="text-xs text-muted-foreground py-2">Edges: {edges?.length ?? 0} prerequisites · Interactive viz coming (mermaid/force graph)</span>
        </div>
        <div className="grid md:grid-cols-2 gap-2 max-h-[300px] overflow-auto">
          {filtered.map(n => (
            <div key={n.id} className="border rounded p-2 text-xs bg-gradient-to-br from-white to-zinc-50">
              <div className="font-mono text-[10px] text-muted-foreground">{n.competencyCode}</div>
              <div className="font-medium">{n.unit}</div>
              <div>{n.competencyEn}</div>
              <div className="text-muted-foreground" dir="rtl">{n.competencyAr}</div>
              <div className="flex gap-1 mt-1"><Badge variant="secondary">{n.stage}</Badge><Badge variant="outline">{n.subject}</Badge></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Daily Briefing (Studivexa + OpenTutor Planner) ──
function DailyBriefing({ institutionId }: { institutionId?: string }) {
  const { data: proposals } = trpc.creator.listPlannerProposals.useQuery(institutionId ? { institutionId } : undefined);
  const utils = trpc.useUtils();
  const create = trpc.creator.createPlannerProposal.useMutation({ onSuccess: () => utils.creator.listPlannerProposals.invalidate() });
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader><CardTitle className="flex gap-2">☀️ Daily Briefing — What to CREATE today <Button size="sm" variant="outline" onClick={() => create.mutate({ institutionId, titleAr: "مراجعة 3AS Ethics — مجموعات ضعيفة", titleEn: "Review 3AS Ethics — weak group", reasonJson: JSON.stringify({ demo: true }), source: "assessment" })}>+ Demo proposal</Button></CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(proposals ?? []).slice(0, 6).map(p => (
            <div key={p.id} className="flex items-center justify-between border rounded p-2 bg-white text-xs">
              <div><div className="font-medium">{p.titleEn}</div><div className="text-muted-foreground" dir="rtl">{p.titleAr}</div></div>
              <Badge variant={p.source === "attendance" ? "destructive" : p.source === "fsrs" ? "default" : "secondary"}>{p.source}</Badge>
            </div>
          ))}
          {(!proposals || proposals.length === 0) && <p className="text-sm text-muted-foreground">No proposals yet — briefing generates after chart analysis. Click +Demo.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Lesson Plan Generator (Algerian Protocol Engine) ──
function LessonPlanBlock({ institutionId }: { institutionId?: string }) {
  const { data: cohorts } = trpc.creator.listCohorts.useQuery(institutionId ? { institutionId } : undefined);
  const { data: nodes } = trpc.creator.listGraphNodes.useQuery({ stage: "3AS" });
  const { data: plans, refetch } = trpc.creator.listLessonPlans.useQuery(institutionId ? { institutionId } : undefined);
  const generate = trpc.creator.generateLessonPlan.useMutation({
    onSuccess: () => { refetch(); }
  });
  const [selected, setSelected] = useState<string>("");
  const [chart, setChart] = useState<string>(JSON.stringify({ size: 24, attendanceRate: 76, weakest: "writing argumentative 42%", recommendation: "remedial", atRisk: [{ name: "Rania" }] }, null, 2));
  const node = nodes?.find(n => n.id === selected) ?? nodes?.[0];
  const cohort = cohorts?.[0];
  return (
    <Card className="border-2 border-emerald-200">
      <CardHeader><CardTitle>🇩🇿 Algerian Fiche — Chart → Lesson Plan (CBA / LMD) {generate.data as any ? <Badge>Venice { (generate.data as any)?.usedVenice ? "✓" : "fallback" }</Badge> : null}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Select value={selected} onValueChange={setSelected}><SelectTrigger className="w-[320px]"><SelectValue placeholder="Select competency node" /></SelectTrigger><SelectContent>{(nodes ?? []).map(n => <SelectItem key={n.id} value={n.id}>{n.stage} · {n.unit.slice(0, 40)}</SelectItem>)}</SelectContent></Select>
          <Select value={cohort?.id ?? ""} disabled><SelectTrigger className="w-[180px]"><SelectValue placeholder={cohort ? cohort.nameEn : "No cohort"} /></SelectTrigger></Select>
        </div>
        {node && <div className="text-xs p-2 bg-zinc-50 border rounded">Competency: <b>{node.competencyEn}</b> <span className="font-mono">[{node.competencyCode}]</span><br /><span dir="rtl">{node.competencyAr}</span></div>}
        <div>
          <label className="text-xs font-semibold">Chart summary (auto from analytics — edit to test tailoring)</label>
          <Textarea value={chart} onChange={e => setChart(e.target.value)} rows={4} className="font-mono text-xs" />
        </div>
        <Button disabled={!node || generate.isPending} onClick={() => node && generate.mutate({
          institutionId, cohortId: cohort?.id, nodeId: node.id, stage: node.stage, stream: node.stream ?? undefined, unit: node.unit, competencyEn: node.competencyEn, competencyCode: node.competencyCode ?? node.id, durationMinutes: 60, ficheKind: "fiche_cba", chartSummaryJson: chart
        })}>
          {generate.isPending ? "Generating with Venice..." : "⚡ Generate CBA Fiche (Venice → fallback)"}
        </Button>
        {generate.data && (
          <div className="border rounded p-3 bg-white max-h-[400px] overflow-auto text-xs">
            <div className="font-semibold mb-1">Generated Fiche (editable JSON → export PDF coming)</div>
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify((generate.data as any).plan?.ficheJson ? JSON.parse((generate.data as any).plan.ficheJson) : (generate.data as any), null, 2)}</pre>
          </div>
        )}
        <div className="space-y-1">
          <div className="text-xs font-semibold">Recent fiches ({plans?.length ?? 0})</div>
          {(plans ?? []).slice(0, 3).map(p => (
            <div key={p.id} className="border rounded p-2 text-xs bg-white">
              <div className="font-medium">{p.title} — {p.stage} {p.stream ?? ""}</div>
              <div className="text-muted-foreground">{new Date(p.createdAt).toLocaleString()} · {p.ficheKind}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Exam Clone + Quiz + Flashcards (Studyield + Smart-Study) ──
function ExamFactoryBlock({ institutionId }: { institutionId?: string }) {
  const { data: clones } = trpc.creator.listExamClones.useQuery(institutionId ? { institutionId } : undefined);
  const utils = trpc.useUtils();
  const createClone = trpc.creator.createExamClone.useMutation({ onSuccess: () => utils.creator.listExamClones.invalidate() });
  const genQuiz = trpc.creator.generateQuiz.useMutation();
  const [title, setTitle] = useState("3AS Ethics — BAC Blanc");
  return (
    <Card>
      <CardHeader><CardTitle>🎯 Exam Factory — Clone + Quiz + Flashcards (FSRS)</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={title} onChange={e => setTitle(e.target.value)} className="max-w-[300px]" />
          <Button onClick={() => createClone.mutate({ institutionId, title, difficulty: "medium", style: "bac" })}>Clone Exam (5 items)</Button>
          <Button variant="outline" onClick={() => genQuiz.mutate({ title, competencyEn: title })}>Quick Quiz</Button>
        </div>
        {genQuiz.data && <pre className="text-xs border rounded p-2 bg-zinc-50 max-h-[200px] overflow-auto">{JSON.stringify(genQuiz.data, null, 2)}</pre>}
        <div className="space-y-1">
          {(clones ?? []).slice(0, 3).map(c => (
            <div key={c.id} className="border rounded p-2 text-xs bg-white">
              <div className="font-medium">{c.title} [{c.difficulty}]</div>
              <pre className="whitespace-pre-wrap text-[11px] max-h-[120px] overflow-auto">{(c.clonedExamJson ?? "").slice(0, 600)}</pre>
            </div>
          ))}
          {(!clones || clones.length === 0) && <p className="text-xs text-muted-foreground">No clones yet — title → Clone Exam to generate same-style BAC practice in 30s.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Teach-Back (Feynman) ──
function TeachBackBlock({ institutionId }: { institutionId?: string }) {
  const [learnerId, setLearnerId] = useState("demo-learner");
  const [prompt, setPrompt] = useState("Explain ethics in business with a local example");
  const [transcript, setTranscript] = useState("");
  const create = trpc.creator.createTeachBack.useMutation();
  const { data: learners } = trpc.records.learners.useQuery(institutionId ? { institutionId } : undefined);
  useEffect(() => { if (learners?.[0]?.id) setLearnerId(learners[0].id); }, [learners]);
  return (
    <Card>
      <CardHeader><CardTitle>🎙️ Teach-Back — Feynman (text/voice)</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Select value={learnerId} onValueChange={setLearnerId}><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent>{(learners ?? []).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
          <Input value={prompt} onChange={e => setPrompt(e.target.value)} className="flex-1" placeholder="Prompt" />
        </div>
        <Textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={3} placeholder="Learner explains concept — type or paste voice transcript (60s)..." />
        <Button disabled={transcript.length < 10} onClick={() => create.mutate({ institutionId, learnerId, prompt, transcript })}>Evaluate Teach-Back (Feynman)</Button>
        {create.data && <pre className="text-xs border p-2 bg-white rounded">{JSON.stringify(create.data, null, 2)}</pre>}
      </CardContent>
    </Card>
  );
}

// ── Focus + Supervision + Research ──
function SupervisionBlock({ institutionId }: { institutionId?: string }) {
  const { data: learners } = trpc.records.learners.useQuery(institutionId ? { institutionId } : undefined);
  const studentId = learners?.[0]?.id ?? "demo";
  const { data: milestones } = trpc.creator.listSupervisionMilestones.useQuery({ learnerId: studentId }, { enabled: !!studentId });
  const createMS = trpc.creator.createSupervisionMilestone.useMutation();
  const [title, setTitle] = useState("M2 Chapter 2 — Methodology");
  return (
    <Card>
      <CardHeader><CardTitle>🎓 University Supervision — LMD Milestones + Consultation</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={title} onChange={e => setTitle(e.target.value)} className="max-w-[300px]" />
          <Button onClick={() => learners?.[0] && createMS.mutate({ institutionId, learnerId: learners[0].id, title })}>+ Milestone</Button>
        </div>
        <div className="text-xs space-y-1">
          {(milestones ?? []).map(m => <div key={m.id} className="border rounded p-2 bg-white flex justify-between"><span>{m.title}</span><Badge variant={m.status === "approved" ? "default" : "secondary"}>{m.status}</Badge></div>)}
          {(!milestones || milestones.length === 0) && <p className="text-muted-foreground">No milestones — create one for your M2 supervisee (maps to UEF/UEM).</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreatorStudioPanel() {
  const institutionId = useInstitutionId();
  // ensure graph seeded
  const seed = trpc.creator.seedGraph.useMutation();
  useEffect(() => { seed.mutate(); }, []); // fire once
  return (
    <div className="space-y-6 p-1">
      <div className="rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white p-6">
        <h2 className="text-2xl font-bold">Creator Studio — Your Algerian Facilitator Advantage</h2>
        <p className="text-white/90 text-sm mt-1">Create cohorts, tailor fiches à l'algérienne, clone BAC exams, run teach-backs — all grounded in your chart + programme. Local-first, institution-scoped, human-in-the-loop.</p>
        <div className="flex gap-2 mt-3 flex-wrap text-xs">
          <Badge variant="secondary">Local-First (SQLite + SQLCipher)</Badge><Badge variant="secondary">CEFR English-only</Badge><Badge variant="secondary">Venice + Ollama fallback</Badge><Badge variant="secondary">APC/CBA + LMD</Badge>
        </div>
      </div>

      <DailyBriefing institutionId={institutionId} />

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="pipeline">Pipeline & Cohorts</TabsTrigger>
          <TabsTrigger value="algerian">Algerian Fiche</TabsTrigger>
          <TabsTrigger value="exam">Exam & Learning</TabsTrigger>
          <TabsTrigger value="graph">Knowledge Graph</TabsTrigger>
          <TabsTrigger value="university">University</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4 mt-4">
          <EnquiriesKanban institutionId={institutionId} />
          <CohortsBlock institutionId={institutionId} />
        </TabsContent>

        <TabsContent value="algerian" className="space-y-4 mt-4">
          <LessonPlanBlock institutionId={institutionId} />
        </TabsContent>

        <TabsContent value="exam" className="space-y-4 mt-4">
          <ExamFactoryBlock institutionId={institutionId} />
          <TeachBackBlock institutionId={institutionId} />
        </TabsContent>

        <TabsContent value="graph" className="space-y-4 mt-4">
          <KnowledgeGraphBlock />
        </TabsContent>

        <TabsContent value="university" className="space-y-4 mt-4">
          <SupervisionBlock institutionId={institutionId} />
          <Card>
            <CardHeader><CardTitle>🔬 Deep Research + Code Sandbox + Focus Room (Phase 3)</CardTitle></CardHeader>
            <CardContent className="text-xs text-muted-foreground">Deep Research (RAG your PDFs + web → cited report), Python sandbox (desktop Tauri sidecar, NumPy/Pandas), Pomodoro focus room with XP — wired via same RAG + Venice gateway. Use Exam Factory + Lesson Plan now; research & sandbox unlock after KB stabilizes.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
