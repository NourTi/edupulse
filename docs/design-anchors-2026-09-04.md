# Design Anchors Addendum — OpenTutor + LingChat for EduPulse Facilitator Vision
**Date:** 2026-09-04 (addendum to `system-design-2026-09-04-facilitator.md`)  
**Response to:** "you still treat my vision as merely statics app... i need to create, to promote... for university researcher" — plus your two new anchors.

---

## You are right — My previous "Heartbeat draft 3 tasks" was still STATIC

It said: *check attendance → remind you to call*. That is monitoring, not **creation**. Your facilitator vision is: **you create cohorts, tailor assessments, promote your offer, integrate tools inside, make decisions, and the platform gives you leverage**. A university lecturer also **creates research paths**, not just logs milestones.

The two anchors you just gave fix this exactly. Here is what I take from each — and what I deliberately leave out.

---

## 1. OpenTutor (zijinz456) — `The first block-based adaptive learning workspace that runs locally`

**Core idea:** *Drop in a PDF. Get AI notes, flashcards, quizzes, knowledge graph, tutor — all in 12 composable blocks that reshape themselves based on how the learner behaves. Local-first (SQLite, no API key needed), grounded in learning science: FSRS spaced repetition, LOOM knowledge graph, LECTOR semantic review, BKT, cognitive load (12 signals).*

**Architecture:** `FastAPI (Tutor/Planner/Layout agents, hybrid BM25+vector RAG, FSRS) + Next.js (12 blocks, Zustand, block-system)`

### What I TAKE for EduPulse (creator-studio, not dashboard)

| OpenTutor Pattern | How it becomes your advantage (facilitator-as-creator) |
|---|---|
| **12 Block-Based Workspace** | Replace my old "white dashboard with KPIs" with a **facilitator studio of blocks** you can add/remove: `Cohort Board`, `Diagnostic`, `Quiz Factory`, `Flashcards (FSRS)`, `Knowledge Graph (LOOM)`, `Study Plan`, `Analytics`, `Consultation Journal`. A secondary teacher sees 4 blocks; a university supervisor sees 6 different blocks. The workspace *progressively unlocks* — you start simple, advanced blocks appear as you use them (exactly like OpenTutor) |
| **Local-First Adaptive Workspace** | The *workspace itself adapts*: AI suggests "You keep opening Rania's quiz — add Flashcards block?" — This is **promotion of your own workflow**, not static monitoring |
| **FSRS 4.5 Spaced Repetition + LECTOR Semantic Review** | Your CEFR/assessment scores become **flashcards that schedule themselves**. Instead of you remembering to review, the block schedules: "Vocab 'past continuous' due in 2 days, prerequisite 'past simple' clusters for co-review" |
| **LOOM Knowledge Graph** | Tracks concept mastery + prerequisites + weak areas across courses. For Algeria: `Stage/Unit/Competency → prerequisites` (e.g., "BAC Math: Derivation → requires Functions"). This is **how you tailor a subject** per student — the graph proposes the next competency, you approve |
| **Cognitive Load (12 signals)** | Detects fatigue, error patterns, brevity. For you: when a learner's quiz shows 3 fast wrong answers + short responses, the **Planner agent** lowers difficulty automatically — you don't manually intervene |
| **3 Agents (Tutor/Planner/Layout)** | Reuse verbatim: `Tutor` (teaches with Socratic + citations), `Planner` (study plan, goals), `Layout` (reconfigures blocks). For a university supervisee, `Planner` becomes research planner |
| **Hybrid RAG + Ingestion Pipeline** | Upload thesis PDF → chunked, vectorized, cited answers — directly solves your "integrate tools inside" (M7 local RAG) |

**What I LEAVE OUT from OpenTutor:**
- Full Python FastAPI backend for web — web will stay TypeScript/Drizzle/SQLite-WASM + Tauri/SQLCipher (your existing). We port the *ideas* (blocks, FSRS, LOOM) in TS, not the Python stack.
- Docker single-user beta limitation, Canvas LMS integration (out of scope).

**Result for your vision:** EduPulse stops being a *record* and becomes a *workspace you build in* — you drag a Quiz Factory block, generate a practice set for that cohort, and the platform promotes it via the enquiry pipeline.

---

## 2. llm-language-learning / LingChat (Archibaldys) — `24/7 AI Speaking Coach to cure "Silent English"`

**Core idea:** Solves **Silent English**: learners read/write fine but freeze speaking due to anxiety, cost, no feedback. Solution: **Zero-anxiety, 24/7 micro-learning (10-30 min), real-time corrections + polished phrasings, real-world scenario roleplay** (career/interviews, travel, socializing). Method: `Pick scenario → Roleplay → Review`.

**Why this is PERFECT for you as an English PhD + language centre:**

| LingChat Pattern | How it becomes your advantage |
|---|---|
| **Zero Social Anxiety (judgment-free)** | Your learners (secondary B1/B2, university) can practice speaking *without you present*. You assign a scenario: "Daily standup" or "BAC oral interview" — they roleplay with AI, you get the transcript + polished corrections later |
| **15-Minutes-a-Day Micro-Learning** | Fits your Tuesday: a learner does 10 min before class, not a 60-min lesson. You *promote* this as a paid add-on: "Unlimited AI speaking practice" |
| **Real-Time Corrections + Polished Phrasings** | Not just "correct", but "say it like a native" — exactly what CEFR writing 48 needs. CEFR scores become *coaching*, not just numbers |
| **Scenario Roleplay** | Build scenario library once: `BAC Oral`, `IELTS Part 2`, `Master Thesis Defense`, `Job Interview`. Reuse across cohorts. Each cohort gets tailored scenarios (secondary → travel/small talk, university → standup/presentation) |
| **High-Frequency over Grammar Drills** | Aligns with your facilitator goal: you don't teach grammar rules repeated; you create *environments where they speak* |

**What I LEAVE OUT:**
- The marketing funnel to LingChat's paid app, generic tech-career-only scenarios. We build an **Algeria/English-teacher scenario pack** tied to your cohorts, not generic travel.

**Integration with OpenTutor blocks:** LingChat becomes a **Block: `Speaking Studio`** — another composable block next to `Quiz` and `Flashcards`. Same block system, same notebook.

---

## 3. Revised Facilitator Vision (corrected — no longer static)

**Before (my mistake):** Dashboard → flags weak learner → draft message.  
**Now (your anchors):** **Studio → Create → Tailor → Promote → Decide.**

```
You (secondary + university)
   │
   ├─ CREATE (OpenTutor blocks): Drop material → AI notes/quiz/flashcards/graph in 30s → tailor to cohort
   ├─ SPEAK (LingChat block): Assign scenario → learner roleplays 10 min → AI corrects → you review
   ├─ PROMOTE (Kanban): New Lead → Trial → Enrolled (your growth engine, not admin)
   ├─ SUPERVISE (university): Per-student notebook → milestones + consultations + deep_research (papers with citations)
   └─ DECIDE (Planner agent): Suggests next cohort, next exercise, next review — you approve
```

For a **university researcher**: each supervisee has a **Notebook** (thesis PDF + drafts + consultations). You click `Deep Research` (from DeepTutor) → it gathers papers, synthesizes with citations → you add to supervision timeline. FSRS schedules their *research skill* review, not just memorization.

---

## 4. Grill A — CEFR Answer

Your grill: **"Is CEFR for ALL secondary learners or only English cohorts?"**

With LingChat in mind, my corrected answer:
**CEFR mandatory ONLY for English cohorts in Phase 1.** Other subjects use their own skill breakdown (e.g., Math: `Concepts/Procedures/Problem-solving`). English cohorts get the full **Speaking Studio + FSRS vocab**; others get quiz/cards without CEFR. This keeps your workload low and lets you *promote* "English + AI Speaking" as a premium strand.

If you teach English to *all* secondary, say "for all" and I flip the toggle.

**Reply:** `"only English"` or `"for all"` — I will lock this and show the block visibility rule.

---

## 5. What Next (still DESIGN ONLY)

You said *don't act till you have the right vision*. I have not written code for this addendum.

**If you confirm this corrected vision (yes / one-line correction), I will:**
1. Update `system-design-2026-09-04-facilitator.md` to this block-studio + speaking-studio version
2. Propose **one** creation block to build first (I suggest: `Quiz Factory` from OpenTutor — 30s enquiry → placement → tailored quiz — proves "create & promote" in web, local-first, with Venice + FSRS)

Awaiting your yes.
