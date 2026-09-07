/**
 * EduPulse Creator Studio — adaptive engine (pure, deterministic, unit-testable).
 *
 * Ports the scheduling/planning logic of the reference repos the project owner
 * supplied, re-implemented as TypeScript (no Python runtime, no external service):
 * - FSRS-style memory state (stability / difficulty / retrievability) adapted from
 *   OpenTutor + Smart-Study-Agent ("FSRS picks the timing", simplified 4.5 curve).
 * - LECTOR-lite competency clustering for a per-learner mastery estimate.
 * - Kahn topological ordering of the Algeria curriculum concept DAG for learning
 *   paths (Smart-Study concept graph + DeepTutor "Plan→Solve" loop).
 * - Studivexa "daily briefing" composition + streak/XP rollups (facilitator-facing,
 *   never punitive, never a grade).
 *
 * Nothing here touches the network or the database; the tRPC layer feeds rows in
 * and persists results out.
 */

export type ReviewRating = 1 | 2 | 3 | 4; // Again / Hard / Good / Easy
export type FsrsState = {
  stability: number; // days
  difficulty: number; // 1..10
  retrievability: number; // 0..1 at last review
  due: string; // ISO date
};

const DAY_MS = 86_400_000;
const MIN_STABILITY = 0.3;
const MAX_STABILITY = 365;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round2 = (value: number) => Math.round(value * 100) / 100;

/** Probability of recall after `elapsedDays` at a given stability (FSRS decay curve, w=0.9 simplified). */
export function retrievabilityAt(stability: number, elapsedDays: number) {
  const s = Math.max(MIN_STABILITY, stability);
  const t = Math.max(0, elapsedDays);
  return round2(clamp(Math.pow(1 + t / (9 * s), -1), 0, 1));
}

/** Retrievability below which a card counts as "decaying" — surfaces in the briefing as due. */
export const DUE_THRESHOLD = 0.9;

export function isDueAt(state: Pick<FsrsState, "stability" | "due">, now: Date = new Date()) {
  if (!state.due) return true;
  const dueTime = Date.parse(state.due);
  if (Number.isNaN(dueTime)) return true;
  return now.getTime() >= startOfDayUtc(new Date(dueTime)).getTime();
}

/**
 * One review of a card → next memory state. Difficulty rises on Again, eases on
 * Easy; stability grows with successful recall and shrinks hard on a lapse.
 */
export function scheduleCard(
  input: { state: Partial<FsrsState>; rating: ReviewRating; reviewedAt?: Date; dailyCap?: number },
): { state: FsrsState; intervalDays: number; xp: number; overduePenalty: boolean } {
  const now = input.reviewedAt ? new Date(input.reviewedAt) : new Date();
  const prevStability = clamp(input.state.stability ?? 2, MIN_STABILITY, MAX_STABILITY);
  const prevDifficulty = clamp(input.state.difficulty ?? 5, 1, 10);
  const prevDue = input.state.due ? Date.parse(input.state.due) : Number.NaN;
  const overduePenalty = !Number.isNaN(prevDue) && now.getTime() > prevDue + DAY_MS;

  const elapsedDays = Number.isNaN(prevDue) ? 0 : Math.max(0, Math.floor((now.getTime() - prevDue) / DAY_MS));
  const r = retrievabilityAt(prevStability, elapsedDays);

  const difficulty = clamp(
    round2(
      prevDifficulty +
        (input.rating === 1 ? 0.9 : input.rating === 2 ? 0.3 : input.rating === 4 ? -0.4 : 0) +
        (overduePenalty ? 0.2 : 0),
    ),
    1,
    10,
  );

  let stability: number;
  let intervalDays: number;
  if (input.rating === 1) {
    stability = round2(clamp(prevStability * 0.35, MIN_STABILITY, 1.2)); // lapse: relearning
    intervalDays = 0;
  } else {
    const quality = input.rating === 2 ? 0.6 : input.rating === 3 ? 1 : 1.4;
    const difficultyFactor = 1 - (difficulty - 1) / 12;
    const retrievabilityBonus = r < DUE_THRESHOLD ? 0.75 : 1 + (1 - r) * 0.4;
    stability = round2(clamp(prevStability * (1 + 1.1 * quality * difficultyFactor * retrievabilityBonus), MIN_STABILITY, MAX_STABILITY));
    intervalDays = input.rating === 2 ? 1 : Math.max(1, Math.round(Math.log(0.9) / Math.log(1 / 1.9) * stability * (overduePenalty ? 0.85 : 1)));
  }

  // LECTOR-lite + scarcity triage: when the daily cap is hit, never schedule a
  // same-day re-queue (keeps the queue honest instead of looping the failed card).
  if (input.dailyCap && input.dailyCap <= 0 && input.rating === 1) intervalDays = 1;

  const due = new Date(startOfDayUtc(now).getTime() + intervalDays * DAY_MS).toISOString();
  const baseXp = input.rating === 1 ? 10 : input.rating === 4 ? 30 : 20;
  return {
    state: { stability, difficulty, retrievability: round2(r), due },
    intervalDays,
    xp: overduePenalty && input.rating !== 1 ? Math.round(baseXp * 0.75) : baseXp,
    overduePenalty,
  };
}

/**
 * LECTOR-lite: cluster card states by competency, average a mastery proxy
 * (0..1) per competency, and expose the weakest ones first for remediation.
 */
export function clusterMastery(cards: Array<{ competencyId?: string | null; state?: Partial<FsrsState> | null }>) {
  const byCompetency = new Map<string, number[]>();
  for (const card of cards) {
    const key = card.competencyId ?? "general";
    const stability = card.state?.stability ?? 1;
    const r = card.state?.retrievability ?? 0.8;
    const mastery = round2(0.6 * r + 0.4 * clamp(stability / 30, 0.1, 1));
    const list = byCompetency.get(key) ?? [];
    list.push(mastery);
    byCompetency.set(key, list);
  }
  return Array.from(byCompetency.entries())
    .map(([competencyId, values]) => ({
      competencyId,
      cards: values.length,
      mastery: round2(values.reduce((a, b) => a + b, 0) / values.length),
    }))
    .sort((a, b) => a.mastery - b.mastery);
}

export type DagNode = { id: string };
export type DagEdge = { fromNodeId: string; toNodeId: string; kind?: string | null };

/** Kahn topological sort over prerequisite edges. Cycles degrade gracefully (append leftovers). */
export function topoOrder<T extends DagNode>(nodes: T[], edges: DagEdge[]): T[] {
  const idSet = new Set(nodes.map(n => n.id));
  const indegree = new Map<string, number>(nodes.map(n => [n.id, 0]));
  const outgoing = new Map<string, string[]>(nodes.map(n => [n.id, []]));
  for (const edge of edges) {
    if (edge.kind && edge.kind !== "prerequisite") continue;
    if (!idSet.has(edge.fromNodeId) || !idSet.has(edge.toNodeId) || edge.fromNodeId === edge.toNodeId) continue;
    indegree.set(edge.toNodeId, (indegree.get(edge.toNodeId) ?? 0) + 1);
    outgoing.get(edge.fromNodeId)?.push(edge.toNodeId);
  }
  // Stable queue order: keep the incoming node order for reproducible paths.
  const queue = nodes.filter(n => (indegree.get(n.id) ?? 0) === 0).map(n => n.id);
  const visited = new Set<string>();
  const ordered: T[] = [];
  const byId = new Map(nodes.map(n => [n.id, n]));
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = byId.get(id);
    if (node) ordered.push(node);
    for (const next of outgoing.get(id) ?? []) {
      indegree.set(next, (indegree.get(next) ?? 1) - 1);
      if ((indegree.get(next) ?? 0) <= 0 && !visited.has(next)) queue.push(next);
    }
  }
  for (const node of nodes) if (!visited.has(node.id)) ordered.push(node); // cycle remainder
  return ordered;
}

export type PathKind = "remedial" | "mastery" | "research" | "exam";

/**
 * Planner policy (Smart-Study: heuristic action selection, FSRS timing).
 * Weak competencies pull their nodes forward, but prerequisites always stay
 * earlier than dependents — the order is topological, never "weak-first" blindly.
 */
export function buildLearningPathPlan(input: {
  nodes: Array<DagNode & { unit: string; competencyEn?: string | null; subject?: string | null; stage?: string | null }>;
  edges: DagEdge[];
  mastery: Array<{ competencyId: string; mastery: number }>;
  kind?: PathKind;
  limit?: number;
}) {
  const masteryByNode = new Map(input.mastery.map(m => [m.competencyId, m.mastery]));
  const ordered = topoOrder(input.nodes, input.edges);
  const withScore = ordered.map((node, index) => ({
    node,
    index,
    mastery: masteryByNode.get(node.id) ?? undefined as number | undefined,
  }));
  const isRemedial = input.kind === "remedial" || input.kind === "exam";
  const selected = withScore
    .filter(entry => (isRemedial && entry.mastery !== undefined ? entry.mastery < 0.75 : true))
    .map(entry => entry.node);
  const orderedIds = (selected.length ? selected : ordered).slice(0, input.limit ?? 8).map(n => n.id);
  const weakCount = withScore.filter(entry => entry.mastery !== undefined && entry.mastery < 0.75).length;
  return {
    orderedNodeIds: orderedIds,
    dropped: withScore.length - orderedIds.length,
    rationale: isRemedial
      ? `${weakCount} weak competencies promoted after their prerequisites (Kahn order).`
      : "Full curriculum order; review markers keep weak nodes visible.",
  };
}

/** Studivexa daily briefing, educator translation. Deterministic: rows in → actions out. */
export function buildDailyBriefing(input: {
  todayLabel: string;
  dueFlashcards: number;
  overdueMilestones: number;
  atRiskLearners: Array<{ learnerId: string; name: string; attendance: number; avgScore: number }>;
  newEnquiries: number;
  pendingProposals: number;
  xpToday: number;
  streakDays: number;
  language?: "ar" | "en";
}): Array<{ key: string; titleAr: string; titleEn: string; reasonAr: string; reasonEn: string; priority: "high" | "medium" | "low" }> {
  const actions: Array<{ key: string; titleAr: string; titleEn: string; reasonAr: string; reasonEn: string; priority: "high" | "medium" | "low" }> = [];
  if (input.atRiskLearners.length) {
    const names = input.atRiskLearners.slice(0, 3).map(l => l.name).join("، ");
    actions.push({
      key: "at-risk-calls",
      priority: "high",
      titleAr: `اتصال أولياء：${names}`,
      titleEn: `Guardian calls: ${input.atRiskLearners.slice(0, 3).map(l => l.name).join(", ")}`,
      reasonAr: `حضور أو نتائج أقل من الحد لدى ${input.atRiskLearners.length} متعلم.`,
      reasonEn: `${input.atRiskLearners.length} learner(s) below the attendance/score floor (min attendance ${Math.min(...input.atRiskLearners.map(l => l.attendance))}%).`,
    });
  }
  if (input.dueFlashcards > 0) {
    actions.push({
      key: "fsrs-queue",
      priority: input.dueFlashcards > 20 ? "medium" : "low",
      titleAr: `بطاقات FSRS المستحقة: ${input.dueFlashcards}`,
      titleEn: `Due flashcards: ${input.dueFlashcards}`,
      reasonAr: "جدولة التكرار المتباعد تنتظر مراجعة اليوم قبل فقدان الثبات.",
      reasonEn: "Spaced repetition queue decayed below the 0.9 retrievability target.",
    });
  }
  if (input.overdueMilestones > 0) {
    actions.push({
      key: "supervision",
      priority: "high",
      titleAr: `متابعة إنجازات LMD المتأخرة: ${input.overdueMilestones}`,
      titleEn: `Overdue supervision milestones: ${input.overdueMilestones}`,
      reasonAr: "بوابات الإشراف الجامعي تحتاج مراجعة بشرية موثقة.",
      reasonEn: "University supervision gates need a human review entry before the next consultation.",
    });
  }
  if (input.newEnquiries > 0) {
    actions.push({
      key: "pipeline",
      priority: "medium",
      titleAr: `طلبات جديدة بلا معالجة: ${input.newEnquiries}`,
      titleEn: `Untouched new leads: ${input.newEnquiries}`,
      reasonAr: "قناة النمو: كل طلب «جديد» يتجمّد دون اختبار أو موعد.",
      reasonEn: "Growth pipeline: new leads age without a scheduled test or trial.",
    });
  }
  if (input.pendingProposals > 0) {
    actions.push({
      key: "planner",
      priority: "low",
      titleAr: `مقترحات المخطط في الانتظار: ${input.pendingProposals}`,
      titleEn: `Planner proposals awaiting decision: ${input.pendingProposals}`,
      reasonAr: "المقترح يبقى اقتراحًا حتى تقرره أنت — لا تنفيذ تلقائي.",
      reasonEn: "The planner proposes, you approve — nothing executes on its own.",
    });
  }
  if (input.xpToday > 0 || input.streakDays > 0) {
    actions.push({
      key: "momentum",
      priority: "low",
      titleAr: `زخم اليوم: ${input.xpToday} نقطة، سلسلة ${input.streakDays} يوم`,
      titleEn: `Today's momentum: ${input.xpToday} XP, ${input.streakDays}-day streak`,
      reasonAr: "علامة نشاط للمعلم، لا تقييم. لا تُرسل للأولياء.",
      reasonEn: "Facilitator activity marker only — never a grade, never sent to guardians.",
    });
  }
  if (!actions.length) {
    actions.push({
      key: "create",
      priority: "low",
      titleAr: "لا طوارئ اليوم — وقتٌ للإنتاج",
      titleEn: "Nothing on fire — create something today",
      reasonAr: "أنشئ نسخة امتحان أو fiche جديدة للفوج الأضعف.",
      reasonEn: "Clone a BAC paper or draft a fiche for the weakest cohort.",
    });
  }
  return actions;
}

const startOfDayUtc = (value: Date) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

/**
 * Streak + 91-day activity heatmap from real timestamps only (no fabricated data).
 * `events` are review dates and completed focus sessions.
 */
export function computeStreakAndHeatmap(input: {
  reviewDates: string[];
  focusSessions: Array<{ startedAt: string; endedAt?: string | null; xpEarned?: number | null; durationMinutes?: number | null }>;
  today?: Date;
  windowDays?: number;
}) {
  const today = startOfDayUtc(input.today ?? new Date());
  const windowDays = input.windowDays ?? 91;
  const counts = new Map<string, { events: number; xp: number }>();
  const bump = (raw: string | null | undefined, xp = 0) => {
    if (!raw) return;
    const time = Date.parse(raw);
    if (Number.isNaN(time)) return;
    const day = startOfDayUtc(new Date(time)).toISOString().slice(0, 10);
    const current = counts.get(day) ?? { events: 0, xp: 0 };
    counts.set(day, { events: current.events + 1, xp: current.xp + xp });
  };
  for (const date of input.reviewDates) bump(date);
  for (const session of input.focusSessions) {
    const minutes = session.durationMinutes ?? 0;
    bump(session.startedAt, session.xpEarned ?? Math.round(minutes * 2));
  }

  let streakDays = 0;
  for (let offset = 0; offset < 400; offset += 1) {
    const day = new Date(today.getTime() - offset * DAY_MS).toISOString().slice(0, 10);
    if (counts.has(day)) streakDays += 1;
    else if (offset === 0) continue; // today may still be in progress
    else break;
  }

  const heatmap: Array<{ date: string; events: number; xp: number }> = [];
  for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
    const day = new Date(today.getTime() - offset * DAY_MS).toISOString().slice(0, 10);
    const entry = counts.get(day) ?? { events: 0, xp: 0 };
    heatmap.push({ date: day, events: entry.events, xp: entry.xp });
  }
  const xpTotal = Array.from(counts.values()).reduce((sum, entry) => sum + entry.xp, 0);
  const xpToday = counts.get(today.toISOString().slice(0, 10))?.xp ?? 0;
  return { streakDays, xpToday, xpTotal, heatmap, activeDays: counts.size };
}

/**
 * LingChat-style English speaking drill (English-only by design lock).
 * Deterministic rubric: fluency, lexical range, grammar signals, task completion.
 * Venice may polish feedback later; the studio never blocks on a model call.
 */
export function evaluateSpeakingDrill(input: { scenarioId: string; transcript: string; seconds: number; targetWords?: number }) {
  const transcript = (input.transcript ?? "").replace(/\s+/g, " ").trim();
  const words = transcript.split(" ").filter(Boolean);
  const uniqueRatio = words.length ? new Set(words.map(w => w.toLowerCase().replace(/[^a-z']/g, ""))).size / words.length : 0;
  const wordsPerMinute = input.seconds > 0 ? (words.length / input.seconds) * 60 : 0;
  const fillers = (transcript.match(/\b(um+|uh+|like|you know)\b/gi) ?? []).length;
  const connectives = (transcript.match(/\b(however|because|although|therefore|in addition|for instance|as a result|on the other hand)\b/gi) ?? []).length;
  const pastTense = (transcript.match(/\b\w+(ed|was|were|went|took|made|gave|told)\b/gi) ?? []).length;
  const target = input.targetWords ?? 90;

  const wordScore = clamp((words.length / target) * 34, 0, 34);
  const fluencyScore = clamp(((wordsPerMinute - 45) / 55) * 20 + 8, 0, 22);
  const lexicalScore = clamp(uniqueRatio * 26, 0, 26);
  const cohesionScore = clamp(connectives * 5 + pastTense * 1.5, 0, 18);
  const penalty = Math.min(12, fillers * 1.5);
  const score = Math.round(clamp(wordScore + fluencyScore + lexicalScore + cohesionScore - penalty, 0, 100));

  const gaps: string[] = [];
  if (words.length < target * 0.6) gaps.push("extend the answer — under the target length");
  if (connectives < 2) gaps.push("add linkers (however, because, as a result)");
  if (pastTense < 1) gaps.push("practice past narration (was/were/-ed)");
  if (fillers >= 4) gaps.push("reduce fillers — pause instead of 'um'");
  if (uniqueRatio < 0.45) gaps.push("vary vocabulary — avoid repeating the same adjectives");

  return {
    score,
    band: score >= 85 ? "C1-like" : score >= 70 ? "B2" : score >= 55 ? "B1" : score >= 40 ? "A2" : "A1",
    metrics: {
      words: words.length,
      wordsPerMinute: Math.round(wordsPerMinute),
      uniqueRatio: round2(uniqueRatio),
      connectives,
      fillers,
    },
    gaps,
    feedback:
      score >= 70
        ? `Clear delivery on ${input.scenarioId}. Keep the pace, and add one concrete Algerian example to make the answer memorable.`
        : `Workable attempt on ${input.scenarioId}. ${gaps.slice(0, 2).join("; ") || "restructure and retry"} — then record it again; the second take usually gains 10-15 points.`,
  };
}
