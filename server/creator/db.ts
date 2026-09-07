import { and, desc, eq, inArray, lt } from "drizzle-orm";
import { getDb } from "../db";
import {
  algerianResources,
  attendanceRecords,
  cohorts,
  cohortLearners,
  conceptEdges,
  consultations,
  enquiries,
  examClones,
  flashcards,
  focusSessions,
  households,
  knowledgeGraphNodes,
  learningAssessments,
  learningPaths,
  lessonPlans,
  notebooks,
  plannerProposals,
  quizzes,
  researchReports,
  supervisionMilestones,
  teachBacks,
  templates,
  learners,
} from "../../drizzle/schema";

// ── Enquiries / Households ──
export async function listEnquiries(institutionId: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(enquiries).where(eq(enquiries.institutionId, institutionId)).orderBy(desc(enquiries.createdAt));
}
export async function createEnquiry(input: typeof enquiries.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.insert(enquiries).values(input);
  return db.select().from(enquiries).where(eq(enquiries.id, input.id)).limit(1).then(r=>r[0]);
}
export async function updateEnquiryStatus(institutionId: string, id: string, status: typeof enquiries.$inferSelect["status"]) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.update(enquiries).set({ status, updatedAt: new Date() }).where(and(eq(enquiries.institutionId, institutionId), eq(enquiries.id, id)));
  return db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1).then(r=>r[0]);
}
export async function listHouseholds(institutionId: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(households).where(eq(households.institutionId, institutionId)).orderBy(desc(households.createdAt));
}
export async function createHousehold(input: typeof households.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.insert(households).values(input);
  return db.select().from(households).where(eq(households.id, input.id)).limit(1).then(r=>r[0]);
}

// ── Cohorts ──
export async function listCohorts(institutionId: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(cohorts).where(eq(cohorts.institutionId, institutionId)).orderBy(desc(cohorts.createdAt));
}
export async function createCohort(input: typeof cohorts.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.insert(cohorts).values(input);
  return db.select().from(cohorts).where(eq(cohorts.id, input.id)).limit(1).then(r=>r[0]);
}
export async function listCohortLearners(cohortId: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(cohortLearners).where(eq(cohortLearners.cohortId, cohortId));
}
export async function enrollInCohort(input: typeof cohortLearners.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.insert(cohortLearners).values(input);
  return input;
}

// ── Knowledge Graph ──
export async function listKnowledgeGraphNodes(stage?: string, subject?: string) {
  const db = await getDb(); if (!db) return [];
  if (stage && subject) return db.select().from(knowledgeGraphNodes).where(and(eq(knowledgeGraphNodes.stage, stage), eq(knowledgeGraphNodes.subject, subject))).orderBy(knowledgeGraphNodes.unit);
  if (stage) return db.select().from(knowledgeGraphNodes).where(eq(knowledgeGraphNodes.stage, stage)).orderBy(knowledgeGraphNodes.unit);
  return db.select().from(knowledgeGraphNodes).orderBy(knowledgeGraphNodes.stage);
}
export async function seedKnowledgeGraphIfEmpty() {
  const db = await getDb(); if (!db) return;
  const existing = await db.select().from(knowledgeGraphNodes).limit(1);
  if (existing.length) return;
  const seed: Array<typeof knowledgeGraphNodes.$inferInsert> = [
    // 3AS — from corpus
    { id: "kg_3as_ethics", stage: "3AS", stream: "all", subject: "English", unit: "Ethics in Business — Ill-Gotten Gains Never Prosper", competencyAr: "إنتاج نص حجاجي حول أخلاقيات الأعمال", competencyEn: "Produce argumentative text on ethics in business (20 lines) + conditional advice", competencyCode: "3AS-SE-ETH-02", kind: "competency" },
    { id: "kg_3as_ancient", stage: "3AS", stream: "LE", subject: "English", unit: "Ancient Civilization — Exploring the Past", competencyAr: "وصف حضارة قديمة ومساهماتها", competencyEn: "Describe ancient civilization rise/fall + contributions (concession)", competencyCode: "3AS-LE-ANC-01", kind: "competency" },
    { id: "kg_3as_education", stage: "3AS", stream: "all", subject: "English", unit: "Education in the World", competencyAr: "مقارنة الأنظمة التعليمية", competencyEn: "Compare educational systems (advice/obligation)", competencyCode: "3AS-ALL-EDU-03", kind: "competency" },
    { id: "kg_3as_ad", stage: "3AS", stream: "SE", subject: "English", unit: "Advertising, Consumers and Safety", competencyAr: "إنجاز استطلاع حول الإعلان", competencyEn: "Hypothesize with may/might/could + consumer safety survey", competencyCode: "3AS-SE-ADV-04", kind: "competency" },
    { id: "kg_3as_feel", stage: "3AS", stream: "LE", subject: "English", unit: "Feelings and Emotions — We Are a Family", competencyAr: "كتابة نص حول المشاعر والصداقة", competencyEn: "Express feelings, humour, friendship advice", competencyCode: "3AS-LE-FEL-06", kind: "competency" },
    { id: "kg_2as_waste", stage: "2AS", stream: "SE", subject: "English", unit: "Poverty and World Resources — Waste not, want not", competencyAr: "وصف مشكلة الفقر والموارد", competencyEn: "Describe poverty/resources (descriptive)", competencyCode: "2AS-SE-POV-02", kind: "competency" },
    { id: "kg_2as_budding", stage: "2AS", stream: "SE", subject: "English", unit: "Budding Scientist — Technology and Innovation", competencyAr: "وصف اختراع علمي", competencyEn: "Describe scientific innovation", competencyCode: "2AS-SE-BUD-03", kind: "competency" },
    { id: "kg_l1_study", stage: "L1", stream: "all", subject: "Study Skills", unit: "How to Succeed at University + LMD System", competencyAr: "فهم نظام LMD وتقنيات الدراسة", competencyEn: "Understand LMD + study skills, time management SMART", competencyCode: "L1-UE-SS-01", kind: "skill" },
  ];
  for (const row of seed) await db.insert(knowledgeGraphNodes).values(row).onDuplicateKeyUpdate({ set: { competencyEn: row.competencyEn } });
  // edges
  const edges: Array<typeof conceptEdges.$inferInsert> = [
    { id: "edge_ethics_prereq_conditional", fromNodeId: "kg_3as_ethics", toNodeId: "kg_2as_waste", kind: "prerequisite" },
    { id: "edge_ancient_prereq", fromNodeId: "kg_3as_ancient", toNodeId: "kg_3as_education", kind: "related" },
  ];
  for (const e of edges) await db.insert(conceptEdges).values(e).onDuplicateKeyUpdate({ set: { kind: e.kind } });
}
export async function listConceptEdges() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(conceptEdges);
}

// ── Lesson Plans ──
export async function listLessonPlans(institutionId: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(lessonPlans).where(eq(lessonPlans.institutionId, institutionId)).orderBy(desc(lessonPlans.createdAt));
}
export async function createLessonPlan(input: typeof lessonPlans.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.insert(lessonPlans).values(input);
  return db.select().from(lessonPlans).where(eq(lessonPlans.id, input.id)).limit(1).then(r=>r[0]);
}
export async function updateLessonPlanStatus(institutionId: string, id: string, status: typeof lessonPlans.$inferSelect["status"]) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.update(lessonPlans).set({ status, updatedAt: new Date() }).where(and(eq(lessonPlans.institutionId, institutionId), eq(lessonPlans.id, id)));
  return db.select().from(lessonPlans).where(eq(lessonPlans.id, id)).limit(1).then(r=>r[0]);
}

// ── Algerian Resources ──
export async function listAlgerianResources() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(algerianResources).orderBy(desc(algerianResources.createdAt));
}
export async function createAlgerianResource(input: typeof algerianResources.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.insert(algerianResources).values(input);
  return input;
}

// ── Planner Proposals ──
export async function listPlannerProposals(institutionId: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(plannerProposals).where(eq(plannerProposals.institutionId, institutionId)).orderBy(desc(plannerProposals.createdAt)).limit(20);
}
export async function createPlannerProposal(input: typeof plannerProposals.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.insert(plannerProposals).values(input); return input;
}
export async function updatePlannerProposal(institutionId: string, id: string, status: typeof plannerProposals.$inferSelect["status"]) {
  const db = await getDb(); if (!db) throw new Error("DB unavailable");
  await db.update(plannerProposals).set({ status }).where(and(eq(plannerProposals.institutionId, institutionId), eq(plannerProposals.id, id)));
  return db.select().from(plannerProposals).where(eq(plannerProposals.id, id)).limit(1).then(r=>r[0]);
}

// ── Exam / Flashcards / Quizzes / TeachBack / Research / Paths / Focus / Supervision / Consultations / Templates / Notebooks ──
export async function listExamClones(institutionId: string) { const db=await getDb(); if(!db) return []; return db.select().from(examClones).where(eq(examClones.institutionId, institutionId)).orderBy(desc(examClones.createdAt)); }
export async function createExamClone(input: typeof examClones.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(examClones).values(input); return input; }

export async function listFlashcards(learnerId: string){ const db=await getDb(); if(!db) return []; return db.select().from(flashcards).where(eq(flashcards.learnerId, learnerId)).orderBy(flashcards.dueAt); }
export async function createFlashcard(input: typeof flashcards.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(flashcards).values(input); return input; }
export async function updateFlashcardFSRS(id: string, fsrsStateJson: string, dueAt: Date){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.update(flashcards).set({ fsrsStateJson, dueAt, lastReviewedAt: new Date() }).where(eq(flashcards.id, id)); }

export async function listQuizzes(institutionId: string){ const db=await getDb(); if(!db) return []; return db.select().from(quizzes).where(eq(quizzes.institutionId, institutionId)).orderBy(desc(quizzes.createdAt)); }
export async function createQuiz(input: typeof quizzes.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(quizzes).values(input); return input; }

export async function listTeachBacks(learnerId: string){ const db=await getDb(); if(!db) return []; return db.select().from(teachBacks).where(eq(teachBacks.learnerId, learnerId)).orderBy(desc(teachBacks.createdAt)); }
export async function createTeachBack(input: typeof teachBacks.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(teachBacks).values(input); return input; }

export async function listResearchReports(institutionId: string){ const db=await getDb(); if(!db) return []; return db.select().from(researchReports).where(eq(researchReports.institutionId, institutionId)).orderBy(desc(researchReports.createdAt)); }
export async function createResearchReport(input: typeof researchReports.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(researchReports).values(input); return input; }

export async function listLearningPaths(learnerId: string){ const db=await getDb(); if(!db) return []; return db.select().from(learningPaths).where(eq(learningPaths.learnerId, learnerId)).orderBy(desc(learningPaths.createdAt)); }
export async function createLearningPath(input: typeof learningPaths.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(learningPaths).values(input); return input; }

export async function listFocusSessions(learnerId: string){ const db=await getDb(); if(!db) return []; return db.select().from(focusSessions).where(eq(focusSessions.learnerId, learnerId)).orderBy(desc(focusSessions.startedAt)); }
export async function createFocusSession(input: typeof focusSessions.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(focusSessions).values(input); return input; }

export async function listSupervisionMilestones(learnerId: string){ const db=await getDb(); if(!db) return []; return db.select().from(supervisionMilestones).where(eq(supervisionMilestones.learnerId, learnerId)).orderBy(supervisionMilestones.dueAt); }
export async function createSupervisionMilestone(input: typeof supervisionMilestones.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(supervisionMilestones).values(input); return input; }

export async function listConsultations(learnerId: string){ const db=await getDb(); if(!db) return []; return db.select().from(consultations).where(eq(consultations.learnerId, learnerId)).orderBy(desc(consultations.meetingAt)); }
export async function createConsultation(input: typeof consultations.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(consultations).values(input); return input; }

export async function listTemplates(institutionId: string){ const db=await getDb(); if(!db) return []; return db.select().from(templates).where(eq(templates.institutionId, institutionId)).orderBy(templates.title); }
export async function createTemplate(input: typeof templates.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(templates).values(input); return input; }

export async function listNotebooks(institutionId: string){ const db=await getDb(); if(!db) return []; return db.select().from(notebooks).where(eq(notebooks.institutionId, institutionId)).orderBy(desc(notebooks.createdAt)); }
export async function createNotebook(input: typeof notebooks.$inferInsert){ const db=await getDb(); if(!db) throw new Error("DB unavailable"); await db.insert(notebooks).values(input); return input; }

// ── Adaptive engine helpers (FSRS queue, streak evidence, briefing inputs) ──
export async function getFlashcard(institutionId: string, id: string) {
  const db = await getDb(); if (!db) return undefined;
  const rows = await db.select().from(flashcards).where(and(eq(flashcards.id, id), eq(flashcards.institutionId, institutionId))).limit(1);
  return rows[0];
}

/** Institution-wide due queue: cards whose due date has arrived, newest urgency first. */
export async function listDueFlashcards(institutionId: string, now = new Date()) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(flashcards).where(and(eq(flashcards.institutionId, institutionId), lt(flashcards.dueAt, new Date(now.getTime() + 86_400_000)))).orderBy(flashcards.dueAt).limit(50);
}

/** FSRS review timestamps used for streak/heatmap evidence — no fabricated activity. */
export async function listFlashcardReviewDates(institutionId: string, learnerId: string, sinceIso: string) {
  const db = await getDb(); if (!db) return [];
  const rows = await db
    .select({ lastReviewedAt: flashcards.lastReviewedAt, dueAt: flashcards.dueAt, learnerId: flashcards.learnerId })
    .from(flashcards)
    .where(and(eq(flashcards.institutionId, institutionId), eq(flashcards.learnerId, learnerId)))
    .limit(500);
  return rows
    .map(row => (row.learnerId === learnerId && row.lastReviewedAt && row.lastReviewedAt.toISOString() >= sinceIso ? row.lastReviewedAt.toISOString() : null))
    .filter((value): value is string => Boolean(value));
}

export async function listFocusSessionsSince(institutionId: string, learnerId: string, since: Date) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(focusSessions).where(and(eq(focusSessions.institutionId, institutionId), eq(focusSessions.learnerId, learnerId))).orderBy(desc(focusSessions.startedAt)).limit(400);
}

export async function countEnquiriesByStatus(institutionId: string) {
  const db = await getDb(); if (!db) return {};
  const rows = await db.select({ status: enquiries.status }).from(enquiries).where(eq(enquiries.institutionId, institutionId));
  return rows.reduce<Record<string, number>>((acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc; }, {});
}

export async function countOverdueSupervision(institutionId: string, now = new Date()) {
  const db = await getDb(); if (!db) return 0;
  const rows = await db
    .select({ id: supervisionMilestones.id })
    .from(supervisionMilestones)
    .where(and(eq(supervisionMilestones.institutionId, institutionId), lt(supervisionMilestones.dueAt, now)));
  return rows.length;
}

export async function countPlannerProposals(institutionId: string, status: typeof plannerProposals.$inferSelect["status"]) {
  const db = await getDb(); if (!db) return 0;
  const rows = await db.select({ id: plannerProposals.id }).from(plannerProposals).where(and(eq(plannerProposals.institutionId, institutionId), eq(plannerProposals.status, status)));
  return rows.length;
}

/** Attendance + assessment rollups per learner (bounded scan — small institutions). */
export async function listLearnerSignalSummaries(institutionId: string) {
  const db = await getDb(); if (!db) return [];
  const learnerRows = await db.select({ id: learners.id, name: learners.name, nameAr: learners.nameAr }).from(learners).where(eq(learners.institutionId, institutionId)).limit(200);
  const ids = learnerRows.map(row => row.id);
  if (!ids.length) return [];
  const [attendanceRows, assessmentRows] = await Promise.all([
    db.select({ learnerId: attendanceRecords.learnerId, status: attendanceRecords.status }).from(attendanceRecords).where(inArray(attendanceRecords.learnerId, ids)),
    db.select({ learnerId: learningAssessments.learnerId, score: learningAssessments.score }).from(learningAssessments).where(inArray(learningAssessments.learnerId, ids)),
  ]);
  const attendanceByLearner = new Map<string, { total: number; good: number }>();
  for (const row of attendanceRows) {
    const entry = attendanceByLearner.get(row.learnerId) ?? { total: 0, good: 0 };
    entry.total += 1;
    if (row.status === "present" || row.status === "late") entry.good += row.status === "late" ? 0.5 : 1;
    attendanceByLearner.set(row.learnerId, entry);
  }
  const scoresByLearner = new Map<string, number[]>();
  for (const row of assessmentRows) {
    const list = scoresByLearner.get(row.learnerId) ?? [];
    if (typeof row.score === "number") list.push(row.score);
    scoresByLearner.set(row.learnerId, list);
  }
  return learnerRows.map(row => {
    const attendance = attendanceByLearner.get(row.id);
    const scores = scoresByLearner.get(row.id) ?? [];
    return {
      learnerId: row.id,
      name: row.name ?? row.nameAr ?? row.id,
      attendance: attendance && attendance.total ? Math.round((attendance.good / attendance.total) * 100) : 100,
      avgScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
      assessmentCount: scores.length,
    };
  });
}

/** Learner's per-competency mastery evidence pulled from FSRS card states. */
export async function listLearnerCardStates(institutionId: string, learnerId: string) {
  const db = await getDb(); if (!db) return [];
  const rows = await db
    .select({ competencyId: flashcards.competencyId, fsrsStateJson: flashcards.fsrsStateJson })
    .from(flashcards)
    .where(and(eq(flashcards.institutionId, institutionId), eq(flashcards.learnerId, learnerId)))
    .limit(500);
  return rows.map(row => {
    let state: { stability?: number; difficulty?: number; retrievability?: number } | null = null;
    try { state = row.fsrsStateJson ? JSON.parse(row.fsrsStateJson) : null; } catch { state = null; }
    return { competencyId: row.competencyId ?? null, state };
  });
}
