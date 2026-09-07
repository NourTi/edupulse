# EduPulse v3 Integration Build — Interior Workspace, AI Console, Adaptive Engine

**Date:** 2026-09-07 (rebuilt record; first draft was lost to a sandbox reset before its commit) · **Branch shipped:** `arena/01a078bc-edupulse` → **PR #2, merged to `main` at `1e3b3c5`** · **CircleCI retired in the same change**
**Owner direction:** clear the compile blocker; integrate the supplied free-tier repos front **and** back; new interior-workspace design; leave Descope and Google auth alone; English-only speaking; no static buttons — real endpoints and real persistence; drop CircleCI.

This complements `docs/system-design-v2-creator-studio-2026-09-04.md` (the plan) — here is what was actually built.

---

## 1. The compile blocker (root cause, fixed)
`pnpm run check` failed with 35 errors, all in `client/src/components/creator/CreatorStudioPanel.tsx`.
- **Cause:** `creatorRouter` (`server/creator/router.ts`, 20 tables, migration `drizzle/0012_creator_studio.sql`) was never registered in `server/routers.ts`, so every `trpc.creator.*` call was untyped and cascaded into implicit-`any` callbacks.
- **Fix:** `creator: creatorRouter` in `appRouter`. No client-side cast was needed.
- **Non-hermetic tests:** `server/descope.config.test.ts` asserted a live Descope project id and the Google test asserted a client secret, so a clean checkout could never pass. Both are now **configuration probes**: they run when the provider is configured and `skip` otherwise. No auth behaviour changed.

## 2. Interior workspace design (v3 tokens)
The cinematic hero and landing CSS are untouched. Inside the workspace:
- `.workspace-scope` token layer in `client/src/index.css` — one Midnight Slate instrument surface (`--card: hsl(199 62% 12% / .92)`), cyan `hsl(187 78% 63%)` for action, amber `hsl(45 92% 68%)` for accent — applied to the workspace content column so `Card`/`Badge`/`Select`/`Textarea` inherit dark treatment automatically.
- Utility vocabulary now used across the studio: `.ws-panel`, `.ws-row`, `.ws-chip`, `.ws-strip`, `.ws-status[data-state]`, `.ws-heat`.
- Every `bg-white` / `bg-zinc-50` "paper patch" and the violet marketing gradient were removed from Creator Studio; landing-only rules (`#roles`, `#subjects`, `#local`) are unaffected because the tokens are scoped.
- Structure borrowed from the supplied anchors (dark tool-status strip, feed, activity grid from the AI-agent dashboard; focus/streak/heatmap from the premium student workspace). Their palettes and glassmorphism were not copied.

## 3. Backend features built (not stubs)
### 3.1 `server/creator/adaptive.ts` — pure TS, 14 unit tests, no runtime or external service
- **FSRS-lite scheduler** `scheduleCard()`: stability / difficulty / retrievability state, lapse penalty, difficulty drift, per-rating interval, daily-cap triage, XP with lapse discount; bounds enforced (difficulty 1–10, stability 0.3–365 d, never NaN).
- **`retrievabilityAt()` / `DUE_THRESHOLD = 0.90`** — the due queue is defined by memory decay, not by a date sort.
- **`topoOrder()`** — Kahn sort over `conceptEdges` (prerequisite edges only), cycle-safe; **`buildLearningPathPlan()`** promotes weak competencies but never ahead of an unmet prerequisite.
- **`clusterMastery()`** — LECTOR-lite per-competency mastery from real card evidence.
- **`buildDailyBriefing()`** — deterministic educator actions from real rows: at-risk guardian calls, FSRS queue depth, overdue supervision gates, ageing new leads, pending planner decisions, momentum. A quiet day says so instead of inventing tasks.
- **`computeStreakAndHeatmap()`** — streak + 91-day grid from review and focus timestamps only.
- **`evaluateSpeakingDrill()`** — English-only rubric (target length, WPM, type-token ratio, connectives, past narration, filler penalty) → score, band, gaps, feedback; tests assert no clinical/diagnostic wording.

### 3.2 tRPC surface
`creator.listDueCards`, `reviewCard` (persists new FSRS state and due date), `dailyBriefing`, `learnerStreak`, `learnerMastery`, `buildPath` (optional persist into `learningPaths`), `speakingScenarios`, `speakEvaluate` (may enqueue a `plannerProposals` retake), `speakPolish` (Venice only when configured, otherwise the rubric stands), `updatePlannerProposalStatus`. All institution-scoped through `needInstitution`; supporting helpers added to `server/creator/db.ts` (`getFlashcard`, `listDueFlashcards`, `listFlashcardReviewDates`, `listFocusSessionsSince`, `countEnquiriesByStatus`, `countOverdueSupervision`, `countPlannerProposals`, `listLearnerSignalSummaries`, `listLearnerCardStates`).
**No new migration** — the v2 data model already covered this, so the TiDB exposure did not grow.

### 3.3 `server/knowledge/freeData.ts` — free public data layer
Selected strictly by `docs/connector-catalog.md` (genuinely keyless, rate-limitable, citable, isolated from private data). 5-minute cache, 20 req/min per caller bucket, citation on every answer, `freeDataHealth()` never echoes a credential.

| Source | Use in EduPulse | Auth |
|---|---|---|
| Open-Meteo (+ geocoding, air quality) | campus logistics: heat/rain **disruption watch** before exam weeks | none, CC-BY attribution emitted |
| CoinGecko `simple/price` | optional market board in the console | none |
| GitHub REST | license/activity vetting of candidate repos before vendoring | optional `GITHUB_PUBLIC_API_TOKEN` (server secret) raises the 60 req/h cap |
| ERIC (US Dept. of Education) | education-research citations for seminars and literature review | none |
| Open Library | library and reading-list enrichment | none |

Rejected: the collection's "free" wrappers that still require a paid key, anything card-gated, and anything that would need learner data upstream.

### 3.4 `server/knowledge/aiConsole.ts` + `knowledge.runFreeSource` / `knowledge.freeSourceStatus`
The useful half of the supplied full-stack AI-agent template, re-implemented in Express + tRPC — no FastAPI, CrewAI, LangGraph, Postgres, or vector DB:
`planConsoleTurn()` (deterministic intent: weather / crypto / repo / research / books / chat / **needs_input**, Arabic + English) → `runConsoleTool()` (public source only, cited, and on failure "no answer was invented; no learner data was sent") → optional `shouldPolish()` + `buildPolishPrompt()` Venice rephrase that may not add facts. Both procedures are `protectedProcedure` and staff-role gated.
`scripts/verify-free-data.ts` (`pnpm verify:free-data`) probes all six adapters and five console turns from a machine with normal egress.

### 3.5 Frontend wiring
- New staff-only workspace view **`ai-console`** ("وحدة الذكاء والمصادر") → `client/src/components/creator/AiConsolePanel.tsx`: source-health strip, suggestion chips, turn list with per-answer citations, Venice-polish switch disabled when unconfigured, explicit privacy notice.
- Creator Studio gains **Adaptive Review** (due queue, four-button rating, live FSRS state, mastery bars, "Build remedial path (Kahn → persist)"), **Focus Room & momentum** (log block, streak, 13×7 heatmap), and **Speaking Studio** (scenario pack, learner link, rubric score, Venice rephrase, auto-queued retake).
- Daily Briefing now reads `creator.dailyBriefing` live rows with accept/dismiss on the planner queue instead of a demo button.

## 4. Verification performed
- `pnpm run check` clean · `vitest`: **106 passed / 2 skipped (31 files)** · `vite build` + esbuild server bundle clean — locally and in GitHub Actions (`validate` pass on PR #2).
- Dev server in-sandbox: `GET /` → 200; `/api/health/database` → `{"configured":false,"reachable":false}`; `creator.listGraphNodes` → `[]` with no DB (graceful, not a 500); protected procedures → 401 JSON envelope.
- **Sandbox limits, stated plainly:** egress allowed only `api.github.com` (and Node rejected the proxied certificate), so the four keyless APIs were never called live here; no MySQL/TiDB engine exists in the sandbox, so persistence is proven at the contract level, not by row writes. Both belong to the Render deploy: watch the boot log for `[Database] Startup migrations applied successfully.` and then run the console.
- `studyield/studyield` was unreachable (GitHub "Not Found"), so those capabilities came from the owner's v2 notes, not from that repository.

## 5. CircleCI retired
`.circleci/config.yml` and the `edupulse-production` context requirement are deleted: the deploy job POSTed to `DEPLOY_WEBHOOK_URL`, a route this repository never exposed, so it could only fail. GitHub Actions is the single CI gate; Render owns deploy-from-branch. If a manual approval gate is wanted later, use a GitHub Actions environment protection rule.
**Operational rule:** exactly one service with `AUTO_MIGRATE=true` per TiDB database at a time — two services racing on `__drizzle_migrations` can leave a half-applied journal.

## 6. Still open, in order
1. Read the Render boot log for `1e3b3c5`: the first attempt at `0012_creator_studio.sql` (12 `enum()` columns, 6 `ON UPDATE now()`) is the one likely TiDB rejection; `/sys` misconfiguration now fails fast with a hint.
2. `pnpm verify:free-data` from a normal network; expect six adapter PASS lines plus cited console turns.
3. Live smoke: `creator.reviewCard` state change, persisted `creator.buildPath`, `creator.dailyBriefing` actions, one `knowledge.runFreeSource` weather answer.
4. Native Windows checks for SQLCipher/Tauri; the v2 desktop bridge should persist `focusSessions`, FSRS state, and speaking drills through SQLCipher, then Anki `.apkg` export and the multi-agent solver chain.
