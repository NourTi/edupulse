# EduPulse Facilitator System Design — 2026-09-04

**Status:** `DESIGN ONLY — no code applied` (as requested)  
**Branch:** `arena/01a06e4f-edupulse`  
**Author:** Arena Agent — Architecture + Education Engineering  
**Sources:** `requirements.md v1.0.0-PROD-SPEC` (your new file), `edupulse-project-history-handoff.md`, `ideas.md`, [DeepTutor (HKUDS, 38.7k★)](https://github.com/HKUDS/DeepTutor), [feifei-companion v4.0 (SimonsTang)](https://github.com/SimonsTang/feifei-companion)

> You clarified: *Desktop (Tauri + SQLCipher) exists, but you are currently using the **web version** — design from here.* You are a facilitator teaching **secondary + university (LMD)** in Algeria and want EduPulse to **facilitate**, not administrate.

---

## 1. Vision — Re-stated for a Dual-Level Facilitator

> **EduPulse = a calm, private, local-first cockpit for one educator who carries two worlds.**
> 
> Secondary: cohorts, attendance, CEFR, guardians, receipts — high frequency, same-day decisions.  
> University: supervision milestones, consultations, papers, recommendations — long-cycle, memory-heavy.
>
> The system’s job is to **reduce context switching** and **surface the next meaningful action** without creating new bureaucracy. It is *not* a full institution ERP you have to configure before you can teach.

**Design mantra (from your past direction):** *discreet, literary, exacting*. Cinematic hero preserved, white vivid CRM below hero, Arabic-first RTL with Cairo/Tajawal + Inter, calm typography. This remains untouched.

---

## 2. Ground Truth — Requirements Mapping

Your `requirements.md` defines a **Local-First Desktop & PWA with Embedded DB** at `<10ms queries, <1.5s boot, AES-256 at rest, one-click JSON/CSV export`. All CRUD, reporting, docs must work in **airplane mode**.

### Functional Modules (FR) → EduPulse Today

| Req Module | Required (req.md) | EduPulse Now (web) | Gap |
|---|---|---|---|
| **M1 Admissions Pipeline** | Kanban: New Lead → Placement → Evaluation → Trial → Offer → Enrolled (FR-1.2), diagnostic CEFR log | `VividDashboard` has activity + birthdays but **no Kanban**, no `Enquiries` entity | **Add `enquiries` table + Kanban** |
| **M2 Student 360 + Household** | Student 360°, multi-guardian household, custom taxonomy (IELTS/TOEFL/BAC) | `learners` + `learnerGuardians` (1-to-many) exists, but no `households` aggregation, no taxonomy picker beyond grade/subjects | **Add `households` + taxonomy** |
| **M3 Cohort & Attendance** | Cohort builder + grid attendance + analytics (<80% flag) | Attendance records + analytics in `StudentSupportEvaluationPanel` (rate, late) but cohort is flat string, no timetable | **Add `cohorts` + `cohortLearners` + weekly schedule** |
| **M4 Academic Advising / Supervision** | PhD milestones, office-hour journal, recommendation queue (FR-4) | `educatorRecords` covers `project/achievement/supervision` generic, but no milestone timeline, no consultation journal | **Add `supervisionMilestones` + `consultations`** |
| **M5 Financial Local Ledger** | Fees, installments, sibling discounts, receipts bilingual PDF | Commerce `products/invoices/payments` with DZD, discounts, refunds, CSV/PDF, simulator — closest to spec | **Add installment plan + sibling rule (local only)** |
| **M6 Communication Hub** | Bilingual templates, WhatsApp web-link, certificates, timeline | `WhatsAppDesktopPanel` (QR, consent), `GuardianMessage` local draft, timeline via `educatorRecords` category | **Add template engine + certificate generator** |
| **M7 Local Evidence-Based AI** | Ollama/LocalAI hook, brief generator, drafter human-in-loop | Venice AI via OpenAI-compatible adapter + local deterministic fallback, capped prompts, citation validation, `askPublic` grounded | **Keep Venice, add local Ollama boundary for offline desktop** |

**Conclusion:** EduPulse web is **70% aligned** on data model; the missing 30% is the *facilitator pipeline* (Kanban → cohort → supervision journal) not the institution ledger.

---

## 3. What We Steal (and What We Don’t) from the Two Repos

### 3.1 DeepTutor (HKUDS) — Agent-Native Tutoring Platform

**What DeepTutor is:** Agent-native architecture: **Tools** (single-shot, LLM-callable) + **Capabilities** (multi-stage pipelines that own the turn) through 3 entry points: CLI / WebSocket / Python SDK. Built-in capabilities: `chat`, `deep_solve` (planning→reasoning→writing), `deep_question` (ideation→generation), `deep_research` (rephrase→decompose→research→report), `math_animator`, `visualize`. Services: multi-provider LLM, embedding (OpenAI/Jina/Ollama), RAG (LlamaIndex + RAG-Anything/MinerU + LightRAG), search (10 providers), session/memory/notebook.

**Useful for EduPulse — ADOPT:**

| DeepTutor Pattern | How it maps to your facilitator need |
|---|---|
| **Capability vs Tool split** | Separate *quick chat* (tool calling) from *deep tasks* (capability). For you: `chat` = visitor Q&A, `deep_solve` = diagnostic brief before parent conference, `deep_research` = gather approved sources for a lesson |
| **Dual-Loop Solving** (`Investigate→Note | Plan→Solve→Check`) | Your “clear view” evaluation today is one-shot. Upgrade to: **Loop A** = gather evidence (assessments/attendance/CEFR/notes) → **Loop B** = plan hypotheses → solve → check non-diagnostic guard. Gives traceable evidence card |
| **RAG with Citations** (`rag`, `paper_search`, `web_search`, `read_source`) | Keep your approved-source retrieval, add **hybrid retrieval** (vector + BM25) and **CitationManager** (single source of truth for `[S1]` IDs) — stop Inventing citations |
| **Knowledge Base + Notebook** | You have `knowledgeSources/chunks` (flat). Add a **Notebook** per learner/cohort (like DeepTutor’s notebook) that aggregates chunks, assessments, consultations into one context builder |
| **Session + Memory** | DeepTutor’s SQLite session store + `read_memory/write_memory`. For web: **local IndexedDB session** that survives reload; for desktop: **SQLCipher memory**. Remembers facilitator’s style (Arabic phrasing, template tone) |
| **Mastery Path / Guided Learning** | `LocateAgent → InteractiveAgent → ChatAgent → SummaryAgent` progressive pages. Reuse for **CEFR mastery path**: locate weak grammar point → interactive page → chat check → summary |

**DO NOT ADOPT (out of scope for facilitator):**
- Full arXiv paper search, math Manim video generation, CLI/WebSocket infra, code execution sandbox. These would bloat a calm cockpit. Keep them as *optional capabilities* gated behind `VENICE` or `OLLAMA` and only for university research, not default.

**License / cost:** Apache-2.0? MIT — but infrastructure is heavy (LlamaIndex, embeddings). For **web local-first**, we cannot run Python + vector DB in browser. We adopt the *idea* (capability layer + citation manager + notebook) but implement it **in TypeScript** with the existing Drizzle + simple hybrid search, optionally calling a local Ollama sidecar only on desktop.

### 3.2 feifei-companion (飞飞学伴 v4.0) — Trinity K12 Companion

**What it is:** “Trinity” — **菲菲老师 (Manager/Scheduler) + 小菲学姐 (Liberal Arts) + 浩云学长 (STEM)**. China K12 (grades 1-12), tied to 人教版/统编版 textbooks. Five learning methods (Simon, Pomodoro, Cornell, First Principles, Feynman + closed-loop review). Heartbeat tasks (proactive: wake → task → check → loop), parent-child translation (“你怎么这么慢！”→ “宝贝…”), knowledge network + textbook index, learning reports (daily/weekly).

**Useful for EduPulse — ADOPT:**

| Feifei Pattern | Facilitator Translation to Algeria |
|---|---|
| **Trinity Roles** | You already have secondary vs university, but **subject-trinity** helps: map your subjects to *Liberal (Arabic/English/French/History/Islamic) → 小菲 style* and *STEM (Math/Physics/Chem/CS) → 浩云 style*. The “clear view” summary can then switch tone: literary encouragement vs step-wise solving |
| **Knowledge Network + Textbook Sync** | Feifei’s killer feature: **Grade + Version + Unit → knowledge point** (e.g., “grade 8 chapter 14 linear functions”). For Algeria: **Stage + Stream + Unit → competency** (e.g., “Secondary 2 Math — functions”, “Primary Arabic — قواعد”). Build a **light knowledge graph** (no external DB) linking your assessments to curriculum nodes, so a weak score automatically surfaces its prerequisites |
| **Heartbeat (主动任务)** | Not a nagging bot, but a **facilitator heartbeat**: every Monday 08:00, generate 3 tasks: “Rania (middle) attendance 76% — call guardian”, “Amal B2 needs writing workshop”. Stored as `educatorTasks` with `dueAt`, completed offline, synced later. You wanted this in requirements (activity timeline) — feifei’s cron + heartbeat is the pattern |
| **Parent Translation (亲子翻译)** | You have guardian drafts. Add a **tone transformer** (Venice prompt) that takes your blunt note and offers 2 variants: **formal Arabic** + **gentle parent Arabic** (feifei’s “旁白翻译官”). Keeps you human, reduces friction |
| **5 Learning Methods + Closed-Loop Review** | Attach to each recommendation: not just “practice”, but *which method*: Cornell notes for history, Feynman for physics, Pomodoro for writing. And a **review reminder** linked to the 14-day `followUpAt` already in `supportEvaluations` |
| **Daily/Weekly Learning Reports** | Your `commerce/reporting` already exports CSV. Add a **Weekly Facilitator Report** (one-page, bilingual) auto-built from attendance + assessment trends — one click, not a dashboard to stare at |

**DO NOT ADOPT:**
- China-specific textbook versions (人教版), 6-12 grade lock, the “parent催促” automation that sends without consent. EduPulse must keep **human-in-the-loop** (your requirement NFR). No background send.

---

## 4. Proposed Architecture — Web-First, Desktop-Ready

You said: **design from web, but preserve Tauri/SQLCipher truth**. So we design a **shared core** that runs in both.

### 4.1 Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Facilitator Shell (Web)                    │
│  Hero (cinematic) → White CRM: Kanban | Cohort | Learner 360 |  │
│  Supervision Journal | Finance (local ledger) | Reports          │
│  Floating AI (Venice) · Heartbeat Tasks bar · Language AR/EN     │
├─────────────────────────────────────────────────────────────────┤
│                     Shared TypeScript Core                         │
│  Capabilities (deep_solve, brief, drafter) · Tools (rag, embed)  │
│  Context Builder (notebook per learner/cohort) · CitationMgr     │
│  Knowledge Graph (Algeria curriculum nodes) · Prompt Templates   │
│  Sync Queue (IndexedDB → SQLCipher when online)                   │
├─────────────────────────────────────────────────────────────────┤
│  Web Runtime                 │  Desktop Runtime (Tauri)            │
│  PWA + IndexedDB (Dexie)    │  Tauri IPC + SQLCipher (AES-256)    │
│  WASM SQLite + vector-lite  │  Sidecar: Ollama/LocalAI (optional) │
│  Service Worker (offline)   │  Encrypted backups (.edupulse)      │
│  Venice (cloud) as primary  │  Venice OR local model as fallback │
└─────────────────────────────────────────────────────────────────┘
```

*Why not RealmDB as spec says?* RealmDB (Atlas Device SDK) is heavy, licensed, and not Tauri-native. **SQLite/SQLCipher via WASM (web) + native SQLCipher (desktop)** meets the same NFR: `<10ms queries, single file, AES-256, relocatable` and already exists in your repo (`src-tauri`, `desktopRuntime.ts`). We stay with it to avoid rewrite.

### 4.2 Data Model — Deltas to Current `drizzle/schema.ts`

**Keep:** `users`, `institutions`, `memberships`, `learners`, `learnerGuardians`, `attendanceRecords`, `cefrAssessments`, `learningAssessments`, `supportEvaluations`, `educatorRecords`, `commerce*`, `knowledgeSources/chunks`, `schoolSettings`

**Add (facilitator gap):**

```
enquiries { id, institutionId, householdId, name, phone, source, targetLang, stage, status: enum[New,TestScheduled,Evaluated,Trial,Offer,Enrolled,Archived], score, assignedTo, createdAt }
households { id, institutionId, primaryGuardianId, address, notes }
cohorts { id, institutionId, nameAr, nameEn, stage, capacity, room, scheduleJson }  // schedule: [{day, start, end}]
cohortLearners { cohortId, learnerId }
supervisionMilestones { id, learnerId (university), title, dueAt, status, evidenceUrl }
consultations { id, learnerId, meetingAt, notes, actionItemsJson, nextAt, createdBy }
templates { id, institutionId, kind: [whatsapp, certificate, report], lang, bodyAr, bodyEn, variablesJson }
knowledgeGraphNodes { id, stage, subject, unit, competencyAr, competencyEn, prereqIds }
notebooks { id, institutionId, ownerId, title, learnerIdsJson, chunkIdsJson, kind: [learner, cohort, supervision] } // DeepTutor notebook idea, lightweight
heartbeatTasks { id, institutionId, learnerId, titleAr, titleEn, dueAt, source: [attendance, assessment, supervision], status }
```

All `institutionId` scoped, row-level tenant isolation stays.

### 4.3 AI Gateway — Venice First, Local Second

```
Visitor Q (floating bubble) → Intent (conversation/platform/enroll/protected) → Approved RAG → Venice (if VENICE_KEY) → Forge fallback → Cited answer + observability (intent/outcome/latency/sourceCount)

Facilitator Aid ("Run evaluation") → Gather notebook (assessments+attendance+CEFR+consultations+graph prereqs) → Build evidence + confidence → Venice JSON (summary/factors/recommendations) → Deterministic local fallback if no key/timeout → Store supportEvaluations → Teacher review gate
```

*Local Ollama* is **desktop-only** sidecar (NFR-2.1 airplane mode). Web never calls Ollama; web uses Venice or local scoring. This satisfies “Local/Self-Hosted LLM hook with zero telemetry” without requiring the browser to run a model.

### 4.4 Bilingual Document Engine (M6)

Templates use **Mustache-lite + RTL mirroring**: one template has `bodyAr`/`bodyEn` + variables (`{{learnerNameAr}}`, `{{attendanceRate}}`). PDF generation stays with `html2canvas + jsPDF` (already used for receipts) but with **Cairo/Tajawal** font embedding for Arabic — fix current Arial fallback.

---

## 5. Facilitator Journey — One Tuesday

> **08:00 Secondary** → Open **Cohort “2M-3 English B2”** → Grid attendance (keyboard, offline) → At-risk flag auto: Rania 76% → Heartbeat creates task “Call Guardian” (not auto-sent)  
> **09:30** → Select Rania → Chart shows 2 months decline → **Run evaluation** → Venice returns (confidence medium, missing CEFR) → You edit → Mark reviewed → **Draft guardian message** → Tone transformer offers gentle variant → Copy  
> **11:00 University** → Open **Supervisee “Amal Master 2 thesis”** → Timeline: chapter 2 submitted, next defence 2026-10-01 → **Consultation log** → Action items → Notebook aggregates all  
> **15:00** → **Weekly report** one-click PDF (attendance + strong/weak + next actions) for your own records, not for cloud.

---

## 6. Roadmap — One Step at a Time (as you asked)

**Phase 0 (done):** Hero + white CRM + roles + CEFR + commerce — shipped.  
**Phase 1 — FACILITATOR COCKPIT (next, web only, no new infra):**
1. Add `enquiries` Kanban (To Do → Enrolled) — your M1. Reuse existing `educatorTasks` UI pattern.
2. Add `households` thin wrapper around `learnerGuardians` (US-02 wants 30s capture: Name/Phone/Target).
3. Add `cohorts` picker + grid attendance (offline IndexedDB first, sync later).

**Phase 2 — CLEAR VIEW AS AID (your current ask):**
4. Notebook + Knowledge Graph lite (stage/subject/unit) + confidence/missing data — already started in 2026-09-04 audit, extend with Trinity tone switch + Feifei heartbeat tasks.
5. Template drafter (formal vs gentle parent Arabic).

**Phase 3 — LOCAL AI OFFLINE (desktop parity):**
6. Desktop sidecar: enable Ollama hook + encrypted backup scheduler (your NFR-3.2). Web stays Venice.

We **do not** implement DeepTutor’s full Python stack nor Feifei’s China textbooks. We harvest their **patterns** (capability layer, citation manager, heartbeat, trinity tone, knowledge graph) in TypeScript.

---

## 7. Non-Functional Decisions

| NFR | Decision |
|---|---|
| **Performance** | Keep Drizzle + SQLite WASM (web) / SQLCipher (desktop). `<10ms` achieved via IndexedDB batch + memoization; no RealmDB migration. |
| **Offline** | PWA Service Worker + IndexedDB as source of truth; `syncQueue` replays to server when online. Certificate/PDF generation pure client. |
| **Security** | AES-256 via SQLCipher passphrase (desktop) + HttpOnly session (web). Export via `downloadBackup()` already password-protected archive ready. |
| **Localization** | Cairo/Tajawal for Arabic display, Inter/Geist for LTR, dynamic `dir` already in `EduPulseApp.tsx`. Add Hijri toggle later; Gregorian default now. |
| **Privacy** | All learner prompts are institution-scoped + human-in-the-loop. No background WhatsApp send; heartbeat only creates *draft tasks*. |

---

## 8. Open Questions — Grill / Office-Hours (pick one to answer next)

**Grill (hard):**  
1. For secondary learners, is CEFR tracking mandatory for *all* or only English cohorts? (Impacts M1 placement test wiring.)  
2. Do you want Kanban to be **per institution** (owner view) or **per facilitator** (your personal pipeline)? Your persona table says both — which is Phase 1?  
3. University supervision: do you need the recommendation letter queue (FR-4.3) now, or can it wait until after thesis milestones?

**Office-Hours (gentle):** Just tell me one story: *“Last week I lost track of X and it cost me Y — if EduPulse had reminded me of Z, I would have …”* I’ll turn that into the first heartbeat rule.

**Reply with one letter (A/B/C) for grill, or one sentence for office-hours, and I will lock the Phase 1 spec and start building *only that*.**

---

*Next step after your approval: I will implement Phase 1.1 Kanban (enquiries) on web with local IndexedDB + server sync, keeping your Tauri/SQLCipher desktop untouched, and verify with `pnpm check / test / build`.*

