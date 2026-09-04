// Chart → Lesson Plan gap summarizer (rule-based + FSRS/BKT, no LLM)
// Input: learner cohort analytics → Output: ChartSummary JSON consumed by generateLessonPlan

export type ChartSummary = {
  cohortId: string;
  stage: string;
  stream?: string;
  size: number;
  attendanceRate: number; // 0-100
  atRiskLearners: Array<{ learnerId: string; name: string; attendance: number; avgScore: number }>;
  subjectAverages: Record<string, number>; // 0-20 or 0-100
  weakCompetencies: Array<{ competencyId?: string; skill: string; avg: number; countWeak: number }>;
  strongest: string;
  weakest: string;
  recommendation: "remedial" | "consolidation" | "extension";
};

export function summarizeCohortChart(input: {
  cohortId: string;
  stage: string;
  stream?: string;
  learners: Array<{ id: string; name: string; attendance: number; scores: Record<string, number> }>;
}): ChartSummary {
  const size = input.learners.length;
  if (!size) return { cohortId: input.cohortId, stage: input.stage, stream: input.stream, size: 0, attendanceRate: 0, atRiskLearners: [], subjectAverages: {}, weakCompetencies: [], strongest: "-", weakest: "-", recommendation: "consolidation" };
  const attendanceRate = Math.round(input.learners.reduce((s, l) => s + l.attendance, 0) / size);
  // subject averages
  const subjects = new Set<string>();
  input.learners.forEach(l => { Object.keys(l.scores).forEach(k => subjects.add(k)); });
  const subjectAverages: Record<string, number> = {};
  for (const subj of Array.from(subjects)) {
    const vals = input.learners.map(l => l.scores[subj]).filter(v => typeof v === "number") as number[];
    subjectAverages[subj] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0;
  }
  const sorted = Object.entries(subjectAverages).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0]?.[0] ?? "-";
  const weakest = sorted[sorted.length - 1]?.[0] ?? "-";

  const weakCompetencies = sorted
    .filter(([, avg]) => avg < 10) // threshold 10/20 or 50/100 heuristic: treat <50% as weak
    .slice(0, 3)
    .map(([skill, avg]) => ({ skill, avg, countWeak: input.learners.filter(l => (l.scores[skill] ?? 100) < 10).length }));

  const atRiskLearners = input.learners
    .filter(l => l.attendance < 80 || Object.values(l.scores).some(v => v < 8))
    .slice(0, 5)
    .map(l => ({ learnerId: l.id, name: l.name, attendance: l.attendance, avgScore: Math.round(Object.values(l.scores).reduce((a, b) => a + b, 0) / Math.max(1, Object.values(l.scores).length) * 10) / 10 }));

  const avgScore = Object.values(subjectAverages).reduce((a, b) => a + b, 0) / Math.max(1, Object.values(subjectAverages).length);
  const recommendation: ChartSummary["recommendation"] = avgScore < 10 || attendanceRate < 80 ? "remedial" : avgScore > 14 ? "extension" : "consolidation";

  return { cohortId: input.cohortId, stage: input.stage, stream: input.stream, size, attendanceRate, atRiskLearners, subjectAverages, weakCompetencies, strongest, weakest, recommendation };
}

// FSRS-lite: next due calculation (simplified, full FSRS in flashcards block)
export function nextDueFromFSRS(stability: number, difficulty: number, rating: 1 | 2 | 3 | 4): Date {
  // rating 1=Again 2=Hard 3=Good 4=Easy — simplified intervals
  const intervals: Record<number, number> = { 1: 0, 2: 1, 3: Math.max(1, Math.round(stability)), 4: Math.max(2, Math.round(stability * 1.5)) };
  const days = intervals[rating] ?? 1;
  const d = new Date(); d.setDate(d.getDate() + days); return d;
}
