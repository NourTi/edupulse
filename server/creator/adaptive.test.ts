import { describe, expect, it } from "vitest";
import {
  buildDailyBriefing,
  buildLearningPathPlan,
  clusterMastery,
  computeStreakAndHeatmap,
  evaluateSpeakingDrill,
  retrievabilityAt,
  scheduleCard,
  topoOrder,
} from "./adaptive";

const DAY_MS = 86_400_000;
const at = (daysFromNow: number) => new Date(Date.UTC(2026, 8, 6) + daysFromNow * DAY_MS);

describe("FSRS-lite scheduler", () => {
  it("grows stability on Good and collapses it on Again", () => {
    const base = { state: { stability: 5, difficulty: 5, due: at(0).toISOString() }, reviewedAt: at(0) };
    const good = scheduleCard({ ...base, rating: 3 });
    const again = scheduleCard({ ...base, rating: 1 });
    expect(good.state.stability).toBeGreaterThan(5);
    expect(good.intervalDays).toBeGreaterThan(0);
    expect(again.state.stability).toBeLessThan(5);
    expect(again.intervalDays).toBe(0);
  });

  it("raises difficulty when the learner lapsed past the due date", () => {
    const state = { stability: 5, difficulty: 5, due: at(-6).toISOString() };
    const result = scheduleCard({ state, rating: 3, reviewedAt: at(0) });
    expect(result.overduePenalty).toBe(true);
    expect(result.state.difficulty).toBeGreaterThan(5);
    expect(result.xp).toBe(15); // 20 base, discounted for the lapse
  });

  it("never returns an impossible memory state", () => {
    let state = { stability: 1, difficulty: 1, due: at(0).toISOString() };
    for (const rating of [4, 4, 4, 1, 1, 1, 3, 3, 2, 4] as const) {
      const next = scheduleCard({ state, rating, reviewedAt: at(0) });
      expect(next.state.difficulty).toBeGreaterThanOrEqual(1);
      expect(next.state.difficulty).toBeLessThanOrEqual(10);
      expect(next.state.stability).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(next.state.due))).toBe(false);
      state = { stability: next.state.stability, difficulty: next.state.difficulty, due: next.state.due };
    }
  });

  it("retrievability decays with elapsed time", () => {
    expect(retrievabilityAt(10, 0)).toBeGreaterThan(retrievabilityAt(10, 20));
    expect(retrievabilityAt(10, 20)).toBeGreaterThan(retrievabilityAt(1, 20));
  });
});

describe("concept DAG ordering", () => {
  const nodes = [{ id: "b" }, { id: "a" }, { id: "c" }, { id: "d" }];
  it("keeps prerequisites before dependents regardless of input order", () => {
    const ordered = topoOrder(nodes, [
      { fromNodeId: "a", toNodeId: "b", kind: "prerequisite" },
      { fromNodeId: "b", toNodeId: "c", kind: "prerequisite" },
    ]).map(node => node.id);
    expect(ordered.indexOf("a")).toBeLessThan(ordered.indexOf("b"));
    expect(ordered.indexOf("b")).toBeLessThan(ordered.indexOf("c"));
    expect(ordered).toContain("d");
  });

  it("ignores non-prerequisite edges and survives a cycle", () => {
    const plain = topoOrder(nodes, [{ fromNodeId: "a", toNodeId: "b", kind: "confuses_with" }]).map(node => node.id);
    expect(plain).toEqual(["b", "a", "c", "d"]);
    const cyclic = topoOrder([{ id: "x" }, { id: "y" }], [
      { fromNodeId: "x", toNodeId: "y", kind: "prerequisite" },
      { fromNodeId: "y", toNodeId: "x", kind: "prerequisite" },
    ]).map(node => node.id);
    expect(cyclic.sort()).toEqual(["x", "y"]);
  });
});

describe("adaptive path planning and mastery", () => {
  const nodes = [
    { id: "n1", unit: "Functions", competencyEn: "Describe functions" },
    { id: "n2", unit: "Derivatives", competencyEn: "Compute derivatives" },
    { id: "n3", unit: "Applications", competencyEn: "Optimise with derivatives" },
    { id: "n4", unit: "Statistics", competencyEn: "Summarise data" },
  ];
  const edges = [
    { fromNodeId: "n1", toNodeId: "n2", kind: "prerequisite" },
    { fromNodeId: "n2", toNodeId: "n3", kind: "prerequisite" },
  ];

  it("promotes weak nodes but never breaks the prerequisite order", () => {
    const plan = buildLearningPathPlan({
      nodes,
      edges,
      mastery: [{ competencyId: "n3", mastery: 0.2 }, { competencyId: "n4", mastery: 0.9 }],
      kind: "remedial",
    });
    expect(plan.orderedNodeIds).toContain("n3");
    expect(plan.orderedNodeIds.indexOf("n1")).toBeLessThan(plan.orderedNodeIds.indexOf("n3"));
    expect(plan.orderedNodeIds).not.toContain("n4");
  });

  it("clusters mastery per competency, weakest first", () => {
    const clusters = clusterMastery([
      { competencyId: "n1", state: { stability: 60, retrievability: 0.98 } },
      { competencyId: "n2", state: { stability: 1, retrievability: 0.4 } },
      { competencyId: "n2", state: { stability: 2, retrievability: 0.5 } },
    ]);
    expect(clusters[0].competencyId).toBe("n2");
    expect(clusters[0].cards).toBe(2);
    expect(clusters[0].mastery).toBeLessThan(clusters[clusters.length - 1].mastery);
  });
});

describe("daily briefing and streak evidence", () => {
  it("prioritises human obligations over activity noise", () => {
    const actions = buildDailyBriefing({
      todayLabel: "2026-09-06",
      dueFlashcards: 34,
      overdueMilestones: 2,
      atRiskLearners: [{ learnerId: "l1", name: "Rania", attendance: 61, avgScore: 7 }],
      newEnquiries: 3,
      pendingProposals: 1,
      xpToday: 40,
      streakDays: 5,
    });
    expect(actions[0].key).toBe("at-risk-calls");
    expect(actions[0].priority).toBe("high");
    expect(actions.map(a => a.key)).toContain("fsrs-queue");
    expect(actions.some(a => /34/.test(a.titleEn))).toBe(true);
  });

  it("tells a quiet day honestly instead of inventing tasks", () => {
    const actions = buildDailyBriefing({ todayLabel: "2026-09-06", dueFlashcards: 0, overdueMilestones: 0, atRiskLearners: [], newEnquiries: 0, pendingProposals: 0, xpToday: 0, streakDays: 0 });
    expect(actions).toHaveLength(1);
    expect(actions[0].key).toBe("create");
  });

  it("counts a streak from real review and focus dates only", () => {
    const today = at(0);
    const result = computeStreakAndHeatmap({
      reviewDates: [at(-1).toISOString(), at(-2).toISOString(), at(-3).toISOString()],
      focusSessions: [{ startedAt: at(0).toISOString(), xpEarned: 50, durationMinutes: 25 }],
      today,
      windowDays: 7,
    });
    expect(result.streakDays).toBe(4);
    expect(result.xpToday).toBe(50);
    expect(result.heatmap).toHaveLength(7);
    expect(result.heatmap.filter(day => day.events > 0)).toHaveLength(4);
  });

  it("does not count a streak when the evidence is stale", () => {
    const result = computeStreakAndHeatmap({ reviewDates: [at(-30).toISOString()], focusSessions: [], today: at(0), windowDays: 14 });
    expect(result.streakDays).toBe(0);
    expect(result.activeDays).toBe(1);
  });
});

describe("English speaking drill (deterministic rubric)", () => {
  it("rewards connected, past-tense narration over filler-heavy answers", () => {
    const strong = evaluateSpeakingDrill({
      scenarioId: "daily_standup",
      seconds: 60,
      transcript:
        "Yesterday I prepared a CBA fiche for my 3AS ethics cohort because my learners struggled with argumentative connectors. However, the timing was tight. As a result, I shortened the feedback stage. In addition, I recorded a model answer, so the second group performed better than the first group.",
    });
    const weak = evaluateSpeakingDrill({ scenarioId: "daily_standup", seconds: 20, transcript: "um like it was good you know the lesson was nice the students were ok" });
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.metrics.connectives).toBeGreaterThanOrEqual(3);
    expect(weak.gaps.length).toBeGreaterThan(0);
    expect(weak.band).toMatch(/A1|A2|B1/);
  });

  it("never produces a clinical or diagnostic label", () => {
    const result = evaluateSpeakingDrill({ scenarioId: "bac_oral", seconds: 240, transcript: "a ".repeat(200) });
    expect(JSON.stringify(result)).not.toMatch(/disorder|diagnos|clinical|dyslexia|ADHD/i);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
