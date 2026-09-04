import { nanoid } from "nanoid";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as dbc from "./db";
import { summarizeCohortChart } from "./chartSummarizer";
import { evaluateTeachBack, generateLessonPlanFiche, generateQuizFromChunks } from "./lessonPlanGenerator";

async function needInstitution(ctx: any, institutionId?: string) {
  const { getUserMemberships } = await import("../db");
  if (institutionId) return institutionId;
  const ms = await getUserMemberships(ctx.user.id);
  const first = ms[0]?.membership.institutionId;
  if (!first) throw new Error("No institution membership");
  return first;
}

export const creatorRouter = router({
  // ── Enquiries Kanban ──
  listEnquiries: protectedProcedure.input(z.object({ institutionId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input?.institutionId);
    return dbc.listEnquiries(inst);
  }),
  createEnquiry: protectedProcedure.input(z.object({
    institutionId: z.string().optional(), name: z.string().min(2).max(160), nameAr: z.string().optional(), phone: z.string().optional(), source: z.string().optional(), targetLang: z.string().optional(), stage: z.string().optional(), status: z.enum(["new","test_scheduled","evaluated","trial","offer","enrolled","archived"]).default("new"), note: z.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createEnquiry({ id: `enq_${nanoid(16)}`, institutionId: inst, householdId: null, name: input.name, nameAr: input.nameAr ?? null, phone: input.phone ?? null, source: input.source ?? null, targetLang: input.targetLang ?? null, stage: input.stage ?? null, status: input.status, score: null, assignedTo: null, note: input.note ?? null, createdById: ctx.user.id });
  }),
  moveEnquiry: protectedProcedure.input(z.object({ institutionId: z.string().optional(), id: z.string(), status: z.enum(["new","test_scheduled","evaluated","trial","offer","enrolled","archived"]) })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.updateEnquiryStatus(inst, input.id, input.status);
  }),

  // ── Cohorts ──
  listCohorts: protectedProcedure.input(z.object({ institutionId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input?.institutionId);
    return dbc.listCohorts(inst);
  }),
  createCohort: protectedProcedure.input(z.object({
    institutionId: z.string().optional(), nameAr: z.string().min(2).max(160), nameEn: z.string().min(2).max(160), stage: z.string().min(2).max(80), taughtLanguage: z.enum(["ar","fr","en"]).default("ar"), capacity: z.number().min(1).max(200).default(24), room: z.string().optional(), scheduleJson: z.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createCohort({ id: `cohort_${nanoid(12)}`, institutionId: inst, nameAr: input.nameAr, nameEn: input.nameEn, stage: input.stage, taughtLanguage: input.taughtLanguage, capacity: input.capacity, room: input.room ?? null, scheduleJson: input.scheduleJson ?? null, knowledgeGraphNodeIds: null, createdById: ctx.user.id });
  }),
  enrollInCohort: protectedProcedure.input(z.object({ cohortId: z.string(), learnerId: z.string() })).mutation(async ({ input }) => {
    return dbc.enrollInCohort({ id: `cl_${nanoid(12)}`, cohortId: input.cohortId, learnerId: input.learnerId });
  }),
  listCohortLearners: protectedProcedure.input(z.object({ cohortId: z.string() })).query(async ({ input }) => dbc.listCohortLearners(input.cohortId)),

  // ── Knowledge Graph (LOOM + Studyield) ──
  listGraphNodes: publicProcedure.input(z.object({ stage: z.string().optional(), subject: z.string().optional() }).optional()).query(async ({ input }) => {
    await dbc.seedKnowledgeGraphIfEmpty().catch(()=>{});
    return dbc.listKnowledgeGraphNodes(input?.stage, input?.subject);
  }),
  listGraphEdges: publicProcedure.query(async () => {
    await dbc.seedKnowledgeGraphIfEmpty().catch(()=>{});
    return dbc.listConceptEdges();
  }),
  seedGraph: protectedProcedure.mutation(async () => { await dbc.seedKnowledgeGraphIfEmpty(); return { ok: true }; }),

  // ── Chart summarizer ──
  summarizeChart: protectedProcedure.input(z.object({
    cohortId: z.string(), stage: z.string(), stream: z.string().optional(),
    learners: z.array(z.object({ id: z.string(), name: z.string(), attendance: z.number().min(0).max(100), scores: z.record(z.string(), z.number()) }))
  })).query(({ input }) => summarizeCohortChart(input)),

  // ── Lesson Plans (Algerian Protocol Engine) ──
  listLessonPlans: protectedProcedure.input(z.object({ institutionId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input?.institutionId);
    return dbc.listLessonPlans(inst);
  }),
  generateLessonPlan: protectedProcedure.input(z.object({
    institutionId: z.string().optional(), cohortId: z.string().optional(), nodeId: z.string().optional(),
    stage: z.string().min(2), stream: z.string().optional(), unit: z.string().min(3), competencyEn: z.string().min(5), competencyCode: z.string().min(3),
    durationMinutes: z.number().min(15).max(180).default(60), ficheKind: z.enum(["fiche_cba","fiche_td","fiche_tp"]).default("fiche_cba"),
    chartSummaryJson: z.string().min(2),
  })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    const generated = await generateLessonPlanFiche({ institutionId: inst, stage: input.stage, stream: input.stream, unit: input.unit, competencyEn: input.competencyEn, competencyCode: input.competencyCode, chartSummaryJson: input.chartSummaryJson, durationMinutes: input.durationMinutes, ficheKind: input.ficheKind });
    const plan = await dbc.createLessonPlan({
      id: `lp_${nanoid(12)}`, institutionId: inst, cohortId: input.cohortId ?? null, nodeId: input.nodeId ?? null,
      title: `${input.stage} — ${input.unit}`, ficheKind: input.ficheKind, stage: input.stage, stream: input.stream ?? null,
      durationMinutes: input.durationMinutes, chartSummaryJson: input.chartSummaryJson, ficheJson: JSON.stringify(generated.fiche), citationsJson: JSON.stringify(generated.citations), status: "draft", createdById: ctx.user.id
    });
    return { plan, usedVenice: generated.usedVenice };
  }),
  updateLessonPlanStatus: protectedProcedure.input(z.object({ institutionId: z.string().optional(), id: z.string(), status: z.enum(["draft","approved","archived"]) })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.updateLessonPlanStatus(inst, input.id, input.status);
  }),

  // ── Algerian Resources ──
  listAlgerianResources: protectedProcedure.query(async () => dbc.listAlgerianResources()),
  createAlgerianResource: protectedProcedure.input(z.object({ title: z.string().min(3), kind: z.enum(["programme","progression","manuel","fiche_exemplaire","grille_bac","other"]).default("other"), stage: z.string().optional(), stream: z.string().optional(), unit: z.string().optional(), sourceUrl: z.string().optional() })).mutation(async ({ input }) => {
    return dbc.createAlgerianResource({ id: `ares_${nanoid(12)}`, institutionId: null, title: input.title, kind: input.kind, stage: input.stage ?? null, stream: input.stream ?? null, unit: input.unit ?? null, storageKey: null, sourceUrl: input.sourceUrl ?? null });
  }),

  // ── Daily Briefing / Planner Proposals (Studivexa + OpenTutor Planner) ──
  listPlannerProposals: protectedProcedure.input(z.object({ institutionId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input?.institutionId);
    return dbc.listPlannerProposals(inst);
  }),
  createPlannerProposal: protectedProcedure.input(z.object({ institutionId: z.string().optional(), learnerId: z.string().optional(), cohortId: z.string().optional(), titleAr: z.string().min(3), titleEn: z.string().min(3), reasonJson: z.string().optional(), dueAt: z.coerce.date().optional(), source: z.enum(["attendance","assessment","cefr","supervision","exam_clone","fsrs"]).default("assessment") })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createPlannerProposal({ id: `prop_${nanoid(12)}`, institutionId: inst, learnerId: input.learnerId ?? null, cohortId: input.cohortId ?? null, titleAr: input.titleAr, titleEn: input.titleEn, reasonJson: input.reasonJson ?? null, dueAt: input.dueAt ?? null, source: input.source, status: "proposed" });
  }),

  // ── Exam Clone / Quiz / Flashcards (Studyield + Smart-Study) ──
  listExamClones: protectedProcedure.input(z.object({ institutionId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input?.institutionId);
    return dbc.listExamClones(inst);
  }),
  createExamClone: protectedProcedure.input(z.object({
    institutionId: z.string().optional(), sourceExamId: z.string().optional(), cohortId: z.string().optional(),
    title: z.string().min(3), style: z.string().default("bac"), difficulty: z.enum(["easy","medium","hard"]).default("medium"), format: z.string().default("bac_written"), clonedExamJson: z.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    let cloned = input.clonedExamJson;
    if (!cloned) {
      const quiz = await generateQuizFromChunks({ institutionId: inst, title: input.title, competencyEn: input.title });
      cloned = JSON.stringify({ title: input.title, items: quiz.items, source: quiz.usedVenice ? "venice" : "fallback" });
    }
    return dbc.createExamClone({ id: `exam_${nanoid(12)}`, institutionId: inst, sourceExamId: input.sourceExamId ?? null, cohortId: input.cohortId ?? null, title: input.title, style: input.style, difficulty: input.difficulty, format: input.format, clonedExamJson: cloned, citationsJson: null, createdById: ctx.user.id });
  }),
  generateQuiz: protectedProcedure.input(z.object({ institutionId: z.string().optional(), title: z.string().min(3), competencyEn: z.string().min(3) })).mutation(async ({ input }) => {
    const quiz = await generateQuizFromChunks({ institutionId: input.institutionId, title: input.title, competencyEn: input.competencyEn });
    return quiz;
  }),
  createFlashcard: protectedProcedure.input(z.object({
    institutionId: z.string().optional(), learnerId: z.string(), competencyId: z.string().optional(), front: z.string().min(2), back: z.string().min(1), frontAr: z.string().optional(), backAr: z.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createFlashcard({ id: `fc_${nanoid(12)}`, institutionId: inst, learnerId: input.learnerId, competencyId: input.competencyId ?? null, front: input.front, back: input.back, frontAr: input.frontAr ?? null, backAr: input.backAr ?? null, fsrsStateJson: JSON.stringify({ stability: 2, difficulty: 5, retrievability: 0.9, due: new Date().toISOString() }), dueAt: new Date(Date.now()+ 24*3600*1000), lastReviewedAt: null });
  }),
  listFlashcards: protectedProcedure.input(z.object({ learnerId: z.string() })).query(async ({ input }) => dbc.listFlashcards(input.learnerId)),

  // ── Teach-Back (Feynman) ──
  createTeachBack: protectedProcedure.input(z.object({ institutionId: z.string().optional(), learnerId: z.string(), prompt: z.string().min(5), transcript: z.string().min(10) })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    const evalRes = await evaluateTeachBack({ prompt: input.prompt, transcript: input.transcript });
    return dbc.createTeachBack({ id: `tb_${nanoid(12)}`, institutionId: inst, learnerId: input.learnerId, prompt: input.prompt, transcript: input.transcript, audioUrl: null, score: evalRes.score, gapsJson: JSON.stringify(evalRes.gaps), feedback: evalRes.feedback });
  }),
  listTeachBacks: protectedProcedure.input(z.object({ learnerId: z.string() })).query(async ({ input }) => dbc.listTeachBacks(input.learnerId)),

  // ── Research Reports (Deep Research) ──
  createResearchReport: protectedProcedure.input(z.object({ institutionId: z.string().optional(), learnerId: z.string().optional(), query: z.string().min(5), reportMd: z.string().min(10) })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createResearchReport({ id: `res_${nanoid(12)}`, institutionId: inst, learnerId: input.learnerId ?? null, query: input.query, sourcesJson: null, reportMd: input.reportMd, citationsJson: null, createdById: ctx.user.id });
  }),
  listResearchReports: protectedProcedure.input(z.object({ institutionId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input?.institutionId);
    return dbc.listResearchReports(inst);
  }),

  // ── Learning Path (Kahn + Smart-Study) ──
  createLearningPath: protectedProcedure.input(z.object({ institutionId: z.string().optional(), learnerId: z.string(), title: z.string().min(3), kind: z.enum(["remedial","mastery","research","exam"]).default("mastery"), orderedNodeIds: z.array(z.string()).min(1) })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createLearningPath({ id: `lpath_${nanoid(12)}`, institutionId: inst, learnerId: input.learnerId, title: input.title, kind: input.kind, orderedNodeIdsJson: JSON.stringify(input.orderedNodeIds), progressJson: JSON.stringify({ completed: [] }) });
  }),
  listLearningPaths: protectedProcedure.input(z.object({ learnerId: z.string() })).query(async ({ input }) => dbc.listLearningPaths(input.learnerId)),

  // ── Focus Session (Studivexa) ──
  createFocusSession: protectedProcedure.input(z.object({ institutionId: z.string().optional(), learnerId: z.string(), cohortId: z.string().optional(), block: z.string().optional(), durationMinutes: z.number().min(1).max(240), xpEarned: z.number().optional() })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createFocusSession({ id: `focus_${nanoid(12)}`, institutionId: inst, learnerId: input.learnerId, cohortId: input.cohortId ?? null, block: input.block ?? null, durationMinutes: input.durationMinutes, xpEarned: input.xpEarned ?? Math.round(input.durationMinutes*2), startedAt: new Date(), endedAt: new Date(Date.now()+ input.durationMinutes*60000) });
  }),

  // ── Supervision (university LMD) ──
  listSupervisionMilestones: protectedProcedure.input(z.object({ learnerId: z.string() })).query(async ({ input }) => dbc.listSupervisionMilestones(input.learnerId)),
  createSupervisionMilestone: protectedProcedure.input(z.object({ institutionId: z.string().optional(), learnerId: z.string(), title: z.string().min(3), titleAr: z.string().optional(), dueAt: z.coerce.date().optional(), status: z.enum(["pending","submitted","reviewed","approved"]).default("pending") })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createSupervisionMilestone({ id: `sup_${nanoid(12)}`, institutionId: inst, learnerId: input.learnerId, title: input.title, titleAr: input.titleAr ?? null, dueAt: input.dueAt ?? null, status: input.status, evidenceUrl: null, createdById: ctx.user.id });
  }),
  listConsultations: protectedProcedure.input(z.object({ learnerId: z.string() })).query(async ({ input }) => dbc.listConsultations(input.learnerId)),
  createConsultation: protectedProcedure.input(z.object({ institutionId: z.string().optional(), learnerId: z.string(), meetingAt: z.coerce.date(), notes: z.string().min(5), actionItemsJson: z.string().optional(), nextAt: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createConsultation({ id: `cons_${nanoid(12)}`, institutionId: inst, learnerId: input.learnerId, meetingAt: input.meetingAt, notes: input.notes, actionItemsJson: input.actionItemsJson ?? null, nextAt: input.nextAt ?? null, createdById: ctx.user.id });
  }),

  // ── Quizzes / Templates / Notebooks ──
  createQuiz: protectedProcedure.input(z.object({ institutionId: z.string().optional(), cohortId: z.string().optional(), competencyId: z.string().optional(), title: z.string().min(3), itemsJson: z.string() })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createQuiz({ id: `quiz_${nanoid(12)}`, institutionId: inst, cohortId: input.cohortId ?? null, competencyId: input.competencyId ?? null, title: input.title, itemsJson: input.itemsJson, sourceChunkIds: null, createdById: ctx.user.id });
  }),
  listQuizzes: protectedProcedure.input(z.object({ institutionId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input?.institutionId);
    return dbc.listQuizzes(inst);
  }),
  listTemplates: protectedProcedure.input(z.object({ institutionId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input?.institutionId);
    return dbc.listTemplates(inst);
  }),
  createTemplate: protectedProcedure.input(z.object({ institutionId: z.string().optional(), kind: z.enum(["whatsapp","certificate","report","fiche_cba","fiche_td"]), lang: z.enum(["ar","en","fr"]).default("ar"), title: z.string().min(3), bodyAr: z.string().optional(), bodyEn: z.string().optional(), bodyFr: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const inst = await needInstitution(ctx, input.institutionId);
    return dbc.createTemplate({ id: `tmpl_${nanoid(12)}`, institutionId: inst, kind: input.kind, lang: input.lang, title: input.title, bodyAr: input.bodyAr ?? null, bodyEn: input.bodyEn ?? null, bodyFr: input.bodyFr ?? null, variablesJson: null });
  }),
});
