# EduPulse Creator Studio — Master Design v2
**Date:** 2026-09-04 • **Status:** DESIGN LOCK — ready to build • **Branch:** `arena/01a06e4f-edupulse`
**Decision Locked:** CEFR = **English cohorts only** (other subjects use skill-based rubric) • `taughtLanguage` tailors the block.
**You said:** *create, promote, integrate tools inside, make decisions — for secondary + university researcher — turn vision into reality now.*

This doc is the **single source of truth** that synthesizes **all 7 anchors** you gave:

| # | Anchor | In one line |
|---|---|---|
| 1 | **HKUDS/DeepTutor** | Agent-native (Tools vs Capabilities), dual-loop `Investigate→Note | Plan→Solve→Check`, citation manager, notebook, mastery path |
| 2 | **SimonsTang/feifei** | Trinity (liberal/STEM tone), knowledge network `Grade→Unit→Point`, heartbeat, parent translation, 5 methods |
| 3 | **zijinz456/OpenTutor** | 12 block-based adaptive workspace, FSRS/LOOM/LECTOR, cognitive load, 3 agents (Tutor/Planner/Layout) |
| 4 | **Archibaldys/llm-language-learning (LingChat)** | Cure Silent English: zero-anxiety 24/7 micro-roleplay (10-30min), real-time polished corrections |
| 5 | **studyield/studyield** | 6 killer AI features incl. **Exam Clone**, multi-agent solver, knowledge graph, teach-back (Feynman), deep research, code sandbox — see below |
| 6 | **codeXsidd/Studivexa** | Premium productivity workspace: AI task breakdown, daily briefing, focus room, gamified XP/streaks, GPA mastery roadmap |
| 7 | **HumphreySun98/Smart-Study-Agent** | OPEAA loop, POMDP, **RL picks action + FSRS picks timing**, LLM only writes quiz, concept DAG, Anki/MCP/Ollama |

> **Correction from v1:** v1 treated you as a monitor (`heartbeat = draft 3 reminder tasks`). v2 treats you as a **creator-promoter** who *creates* cohorts/materials/exams/paths, *promotes* via Kanban, and *decides* via analytics. The studio is built from **blocks** you assemble, not a static dashboard you watch.

---

## 1. Studyield — Deep Cross-Reference (your 13 Key Capabilities)

Studyield workflow: `Upload PDF/Exam → AI extracts graph → quiz/flashcards/exam clone → teach-back → solver → deep research → analytics`. **For an educator, this is a factory, not a tool.**

| Capability | What it is in Studyield | Cross-reference: What YOU need as educator (secondary + university) | Verdict for EduPulse |
|---|---|---|---|
| **🎯 Exam Clone** | Upload past BAC/past paper → generate new paper same style/difficulty/format | **Your #1 creator advantage:** Upload 2024 BAC Math → clone 3 variants for Trial vs Enrolled. Tailor per cohort in 30s. Promote as premium | **TAKE — Phase 1 priority**. Block `Exam Clone` in TypeScript. Venice generates, you keep style slider. |
| **🤖 Multi-Agent Problem Solver** | Analysis → Solution → Verification agents, streaming | Secondary STEM: solver shows steps for you to adapt; University: thesis problem broken down + verified. You decide final answer, not AI | **TAKE** — port as `Capabilities/solver` (3-agent prompt chain) with verification gate. |
| **🕸️ Knowledge Graph** | Auto-extract entities/relations → interactive viz | Algeria curriculum nodes `Stage→Subject→Unit→Competency`. Links weak score to prerequisite automatically (you tailor, not hunt) | **TAKE** — combine with OpenTutor LOOM + DeepTutor notebook. Store in `knowledgeGraphNodes` + `competencyEdges`. |
| **🎙️ Teach-Back (Feynman)** | Learner explains (text/voice) → AI evaluates depth | Secondary: learner records 60s "explain photosynthesis" → AI scores gaps → you see Feynman report before parent meeting. University: thesis defence rehearsal | **TAKE** — block `Teach-Back` (voice via Web Speech API, no backend TTS needed). |
| **🔬 Deep Research Mode** | RAG your docs + web search → structured report + citations | University researcher: upload 10 papers + thesis draft → RAG synthesis with citations for literature review. Grounded in your approved sources only | **TAKE** — DeepTutor `deep_research` + Studyield RAG. Desktop Ollama when offline. |
| **💻 Code Sandbox** | Secure Python (NumPy/Pandas) | CS classes: live code execution for learners, without leaving EduPulse. University: data analysis for thesis | **TAKE — desktop only**. Web shows read-only; Tauri sidecar runs `pyodide` or local Python. |
| **📚 Knowledge Base** | Upload PDF/DOCX → vector + Qdrant | **Foundation for everything.** Your single private library (BAC papers, thesis PDFs) that all blocks cite. Local-first (Qdrant → SQLite vector-lite) | **TAKE — foundation block**. `knowledgeSources/chunks` already exists, extend to PDF ingestion. |
| **🃏 Flashcards SRS** | FSRS spaced repetition | Vocabulary (CEFR writing 48) + BAC formulas auto-scheduled. FSRS > SM-2 (Studyield uses it, Smart-Study proves 4.5x gain when scarce) | **TAKE** — FSRS with OpenTutor LECTOR clustering. Shared with Smart-Study logic. |
| **📝 AI Quizzes** | Auto-quiz from materials | Generate per cohort, per competency. Reuse Exam Clone pipeline with lighter prompt | **TAKE** — part of Exam Clone factory. |
| **💬 RAG Chat** | Grounded chat with `[S1]` citations | Learner asks "why derivative?" → answer from YOUR graph, cited. You audit. | **TAKE** — DeepTutor CitationManager already. |
| **🗺️ Learning Paths** | AI optimal route | Planner agent generates mastery path `Locate→Interactive→Chat→Summary` (DeepTutor) now personalized per learner via Smart-Study RL | **TAKE** — combine Smart-Study DAG + OpenTutor LECTOR. |
| **📊 Progress Analytics** | Study time, mastery, velocity | Your decision layer: cohort mastery heatmap, at-risk (<80% attendance), velocity drop. No generic XP yet — yours is facilitator-facing | **TAKE** — Studivexa productivity graph + OpenTutor analytics block. |
| **🌍 12 Languages** | EN/FR/AR/... i18n | You need **AR/FR/EN bilingual** docs & tone transformer (feifei). Keep 3, not 12 — Tahawal/Cairo already. | **TAKE 3-language core**, not 12. AR formal + gentle variant. |

**What we LEAVE from Studyield heavy infra:** NestJS 27 modules, PostgreSQL/Qdrant/Redis/ClickHouse, Stripe billing, Flutter mobile — all too heavy for your single-educator local-first PWA + Tauri/SQLCipher. We re-implement patterns in **TypeScript + Drizzle + SQLite-WASM (+ Qdrant-lite = `sqlite-vec` or simple hybrid BM25+vector)**.

---

## 2. Studivexa — What is Good for an Educator's Advantage?

Studivexa vision: *transform chaos into peak productivity; not a checklist — an agent that monitors, rewards, intervenes.* Ultra-premium UI, glassmorphism, **Daily Briefing, Task Breakdown, Focus Room, Gamification (XP/streak/heatmap), Mastery Roadmap, Productivity Score**.

**Cross-reference:**

| Studivexa Feature | Educator translation — why you want it |
|---|---|
| **AI Task Breakdown** | Large goal "Prepare BAC cohort" → auto 15-30min subtasks (upload BAC → clone → schedule trial → draft offer). You create, it slices. |
| **AI Daily Briefing & Quick Actions** | Each morning one card: "3 trials pending, Rania needs call, 5 flashcards due" + one-click actions. Replaces nagging heartbeat. |
| **Procrastination Simulator** | **Teach-back for motivation:** show learner "if you skip 7 days, retention drops X% (FSRS curve)" — gentle nudge, not shame. |
| **Focus Room + Pomodoro + AI Tutor** | Secondary learner enters distraction-free practice; you see time-on-task. University researcher writes thesis in focus. |
| **Gamified XP / Streak / Heatmap** | For learners: streak for daily speaking (LingChat). For you: streak for daily brief checks (habit, not score). |
| **Mastery Roadmap / GPA Predictor** | Your version: **Mastery Roadmap per cohort** (nodes green/yellow/red) + "predicted BAC/IELTS if trajectory continues" — you decide intervention. |
| **Portfolio & Certificates** | One-click bilingual certificate (M6) — Studivexa polish applied to your template engine. |

**TAKE:** Task Breakdown, Daily Briefing, Focus Room (light), Mastery Roadmap, Certificates polish, heatmap analytics.
**LEAVE:** Premium glassmorphism bloat, MongoDB/Render deployment, Gemini lock-in (we use Venice), GPA specifics (we map to CEFR/BAC).

---

## 3. Smart-Study-Agent — The Brain that Learns How You Learn

**Tagline:** *RL picks the action, FSRS picks the timing, LLM only writes the quizzes.*

- **OPEAA Loop:** Observe → Plan → Evaluate → Adapt (5-phase adaptive agent)
- **POMDP belief state:** maintains probability of mastery per concept
- **Two policies:** Q-learning + LinUCB bandit (honest benchmark: heuristic +35% beat Q-learning +18% short-horizon — heuristic shipped)
- **FSRS per-topic memory:** stability, difficulty, recall probability, next due date (Smart-Study proved: with 24 topics scarce slots → FSRS 4.5x > round-robin; with 6 topics ample → no diff). **Triage needs scarcity — you have 30+ learners, scarce time.**
- **Concept Graph:** DAG with Kahn topological sort (prerequisite order)
- **Extras:** Chrome extension, Anki `.apkg` export from question_bank, MCP server, Ollama/OpenAI-compat adapter, multi-format loader (PDF/TXT/MD/DOCX/PPTX/VTT/SRT)

**Cross-reference for university + secondary:**

| Smart-Study | Educator advantage |
|---|---|
| RL + Bandit picks *what* to practice | Instead of you manually picking learner's next exercise, agent proposes: "Amal weakest is 'thesis argumentation' — assign teach-back, not quiz" |
| FSRS picks *when* | Your flashcards/quizzes schedule themselves; you approve weekly. Pro handling of long textual explanations quality is predictor. |
| Concept DAG + Kahn sort | Prerequisite chain ensures you don't teach *derivation* before *functions* — path is topologically correct. |
| Multi-format ingestion | Drop thesis VTT transcript + PPTX + PDF — unified knowledge base. |
| Anki export + MCP | Learner exports to Anki on phone; you expose agent via MCP to your desktop Claude. |
| Honest eval (heuristic won) | We ship heuristic + LinUCB first, Q-learning later — no research hype, ships fast. |

**TAKE:** OPEAA loop, concept DAG (Kahn), FSRS memory state, RL heuristic/LinUCB for action selection, multi-format ingest, Anki export.
**LEAVE:** Python Streamlit 8 pages, separate Chrome extension (web block suffices), heavy server — port logic to TS.

---

## 4. Unified Architecture — Web-First, Desktop-Ready (TS only)

```
┌─ Facilitator Shell (PWA) ──────────────────────────────────┐
│ Hero → White Studio: Kanban | Cohort | Learner 360 |       │
│ Supervision Journal | Knowledge Base | Exam Factory |       │
│ Daily Briefing · Focus Room · AR/EN/FR                     │
├─ Block System (12 composable, OpenTutor-inspired) ─────────┤
│ [Knowledge Graph (LOOM)] [Exam Clone] [Quiz] [Flashcards]   │
│ [Teach-Back] [Speaking Studio (LingChat)] [RAG Chat]        │
│ [Deep Research] [Code Sandbox*] [Analytics] [Notebook]      │
│ *Sandbox desktop-only                                      │
├─ Agent Layer (3 agents, Studyield+OpenTutor) ──────────────┤
│ Tutor (Socratic+citations) · Planner (path+FSRS+RL)        │
│ Layout (suggest block changes from behavior)               │
│ Capabilities: deep_solve(deep), examClone, deep_research   │
│ Tools: rag + embed + read_source + conceptGraph            │
├─ Core Services ────────────────────────────────────────────┤
│ CitationManager [S1] · Context Builder (notebook)          │
│ Hybrid RAG (BM25+vector-lite) · FSRS/LECTOR · BKT · RL     │
│ SyncQueue (IndexedDB → SQLCipher) · Template Engine (AR)   │
├─ Runtime ───────────────┬────────────────────────┬──────────┤
│ Web: PWA + SQLite WASM  │ Desktop: Tauri +       │ AI Gateway│
│ + sqlite-vec + SW       │ SQLCipher AES-256 +    │ Venice 1st│
│ offline-first           │ Ollama sidecar +       │ Ollama FB │
│                         │ encrypted backup       │ (offline) │
└─────────────────────────┴────────────────────────┴──────────┘
```

**Why not heavy infra:** Keep your existing `drizzle/schema.ts` + `SQLCipher` — satisfies `<10ms, AES-256, one-file, airplane mode` (requirements). No Postgres/Qdrant/Redis.

### 4.1 Data Model Deltas (add to current)

```sql
-- v1 gaps already planned:
enquiries, households, cohorts, cohortLearners, supervisionMilestones, consultations,
templates, knowledgeGraphNodes, notebooks, heartbeatTasks → reframe heartbeatTasks as plannerProposals

-- v2 new (from 3 repos):
knowledgeBases { id, institutionId, title, kind: [cohort|learner|supervision], chunkIds } -- Studyield KB
examClones { id, institutionId, sourceExamId, clonedExamJson, style, difficulty, format, cohortId }
flashcards { id, institutionId, learnerId, front, back, fsrsStateJson, dueAt, competencyId } -- FSRS
quizzes { id, institutionId, cohortId, competencyId, itemsJson, sourceChunkIds }
teachBacks { id, learnerId, prompt, transcript, score, gapsJson, audioUrl }
researchReports { id, institutionId, query, sourcesJson, reportMd, citationsJson }
conceptEdges { fromNodeId, toNodeId, kind: prerequisite } -- DAG for Kahn
learningPaths { id, learnerId, orderedNodeIdsJson, kind: [remedial|mastery|research] }
focusSessions { id, learnerId, cohortId, startedAt, endedAt, block, xpEarned }
-- Keep: flashcards.fsrsState = {stability, difficulty, retrievability, due} (Smart-Study)
```

`taughtLanguage` (English-only CEFR) gates: `cefrAssessments` only visible if `learner.cohort.taughtLanguage == 'en'` or manual override.

### 4.2 AI Gateway (Venice-first)

`RAG Chat / Exam Clone / Research` → hybrid retrieval (approved sources + uploaded docs) → Venice (primary) → deterministic fallback (template + BM25) → CitationManager validates `[S1]` → stored with `notebookId` → teacher review gate. Desktop Tauri can flip to `SMARTSTUDY_LLM_BASE_URL=ollama` (Humphrey pattern) for offline.

---

## 5. Roadmap — Now That CEFR is Locked, Build Creator-First

**Phase 0 — DONE:** Hero + white CRM + CEFR + commerce.

**Phase 1 — FOUNDATION: Create & Promote (build NOW, web only, 2 weeks)**

1. **Enquiries Kanban** (`New → TestScheduled → Evaluated → Trial → Offer → Enrolled`) + `households` — your growth engine (M1). Local IndexedDB first, Drizzle sync.
2. **Knowledge Base Block** — upload PDF/DOCX (BAC past paper) → chunk → hybrid search. Foundation for all AI blocks. Reuse `knowledgeSources/chunks`.
3. **Exam Factory Lite** — clone 1 past paper → 5 new items (same style) via Venice prompt + citation check. Proves *create* in 30s.

*Deliverable Phase 1:* you can drag a BAC PDF → get a cloned practice set → schedule trial → enroll — all offline-capable, all cited.

**Phase 2 — ADAPTIVE STUDIO (teach-back + spaced + graph)**

4. **Knowledge Graph (LOOM) + Learning Path (Kahn)** — auto-extract nodes, prereq edges, interactive viz (mermaid).
5. **Flashcards FSRS + Quiz Block + Teach-Back** — FSRS state + LECTOR clustering; voice teach-back with Feynman scoring.
6. **Planner Agent (RL heuristic + FSRS)** — proposes *what* and *when* per learner;  you approve in Daily Briefing.
7. **Speaking Studio (LingChat) + Focus Room (Studivexa)** — 10 scenario packs (BAC Oral, IELTS, Thesis Defense), XP streak.

**Phase 3 — UNIVERSITY RESEARCHER**

8. **Supervision Notebook + Deep Research** — per-supervisee notebook, deep_research with citations, milestone timeline, recommendation queue.
9. **Multi-Agent Solver (Analysis→Solution→Verification)** — streaming steps, you verify.
10. **Code Sandbox (desktop)** + Anki export + MCP server — sidecar only.

**Phase 4 — POLISH**

11. Bilingual certificate/template engine (Cairo/Tajawal), Weekly Facilitator Report (one-page bilingual), heartbeat → Daily Briefing (no more "draft 3 tasks" nag).

---

## 6. Non-Functional Locks

- **Local-first:** PWA IndexedDB (web) + SQLCipher (desktop) + single-file backup `.edupulse`. No cloud DB for M5 ledger.
- **Performance:** `<10ms` via SQLite-WASM + memoization; no RealmDB.
- **Security:** AES-256 SQLCipher passphrase + HttpOnly session; no background WhatsApp send (human-in-loop).
- **Arabic:** `bodyAr/bodyEn` templates, RTL mirroring, Cairo/Tajawal embedded in jsPDF.

---

## 7. Next Step — I start Phase 1.1 NOW unless you stop me

With **CEFR only English locked** and vision locked as **creator studio**, the correct first build is **Enquiries Kanban + Knowledge Base ingestion** (steps 1+2) — because Exam Clone, RAG Chat, Teach-Back all *depend* on it.

If you say **GO**, I will:
- Add `enquiries` + `households` + `knowledgeBases` schema (Drizzle, non-breaking)
- Ship white-CRM Kanban (drag columns) + PDF ingest (chunk + BM25)
- Keep Tauri/desktop untouched, `pnpm check/test/build` green, commit to `arena/01a06e4f-edupulse`

Reply **"GO"** or **"change X"**. Otherwise I await your GO to turn vision into reality.
