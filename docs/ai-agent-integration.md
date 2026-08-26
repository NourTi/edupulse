# EduPulse AI Agent Integration

## What the agent is

EduPulse uses a server-side grounded policy assistant. It is not a general unrestricted chatbot and it does not read private learner records. The welcome page renders `PublicKnowledgeAgent`, which reuses `ParentPolicyChat`.

## Request path

1. A visitor enters a question in `client/src/components/ParentPolicyChat.tsx`.
2. The public chat sends only the visitor’s question; it does not require a session or expose an institution identifier in the browser.
3. `knowledge.askPublic` in `server/routers.ts` handles greetings, thanks, and farewells before protected-record checks or retrieval, then rejects individual-record questions before retrieval.
4. `getPublicKnowledgeChunks` in `server/db.ts` resolves the explicitly configured public school identity for this deployment and selects only `ready` and `public` sources for that institution. If no public identity exists, it selects only intentionally global sources whose `institutionId` is null; it never searches every institution.
5. `retrieveRelevantChunks` ranks matching chunks by shared Arabic/English terms.
6. The server sends only the matching approved excerpts to `invokeLLM` in `server/_core/llm.ts`.
7. The system prompt requires the model to use only those excerpts, cite factual claims as `[S1]`, `[S2]`, and say when the evidence is insufficient.
8. The response returns the answer and deduplicated source references. The UI renders the citations as links when a source URL exists.

## How an institution makes it functional

An administrator first saves the institution brand settings. This associates the public school settings row with the institution ID used as the deployment’s explicit public-school mapping. The administrator then uses Knowledge Administration to import reviewed text or a safe public webpage. The import is role-protected, stores the source and chunks, and marks the administrator-submitted source `ready` for retrieval. Visitors can then ask general questions without signing in, and the server retrieves only that mapped institution’s public sources.

The current managed lightweight webpage importer uses a server-side `fetch` plus readable-text extraction. `server/knowledge/crawl4aiGateway.ts` defines the versioned Crawl4AI-compatible worker hand-off for a later isolated crawler. It validates safe public URLs and normalizes worker output into citation-ready chunks. The protected `knowledge.prepareCrawl4AIJob` procedure exposes this hand-off to owner, administrator, and registrar accounts without executing crawler code inside the web request. Crawl4AI does not answer visitors directly; it prepares source text for the same approved retrieval path.

## Configuration

The agent uses the preconfigured server-side Forge-compatible LLM adapter. Its required runtime variables are:

| Variable | Purpose |
|---|---|
| `BUILT_IN_FORGE_API_URL` | OpenAI-compatible model endpoint used by the server adapter. |
| `BUILT_IN_FORGE_API_KEY` | Server-only bearer credential for the model endpoint. |
| `DATABASE_URL` | Institution sources and searchable chunks. |
| `JWT_SECRET` | Application session security; not sent to the model. |

The current router requests model `gpt-5-mini` and allows the adapter to retry transient network failures. The browser never receives the LLM credential. If the model credential is missing or the endpoint rejects the request, the UI shows a safe retry message and source links instead of exposing an exception or fabricating an answer.

## Privacy and safety boundaries

The assistant refuses questions about individual grades, attendance, fees, admissions decisions, discipline, or other learner records. The server performs that refusal before database retrieval. It also treats retrieved excerpts as untrusted reference data and explicitly instructs the model not to follow instructions contained inside source documents.

The assistant is only functional for factual policy questions when the institution has imported relevant public sources. With no configured institution identity or no matching source, it correctly explains that no approved answer is available. That is an intentional safe empty state, not a model failure.

## Current verification

The project passes TypeScript, the full unit suite, and the production build. The tests cover privacy refusal, source ranking, citation deduplication, safe URL validation, readable-text extraction, crawler result normalization, and non-administrator ingestion boundaries. A live model call is not executed during automated tests to avoid sending test prompts to the configured model service; a signed-in institution with approved sources is required for end-to-end production testing.

## Visitor-access and conversational-fix note

The welcome assistant was already exposed through a public tRPC procedure, but the UI also queried school identity on mount and described the assistant as institution-linked. That made the public experience appear dependent on sign-in. The chat now sends no session or institution identifier for visitor questions. The server resolves the deployment’s explicitly configured public school identity, when present, and retrieves only ready sources marked public for that institution. If no public identity is configured, it does not search another tenant.

The “thank you” defect came from treating every message as a knowledge question. The assistant now detects common Arabic and English greetings, thanks, and farewells before protected-record checks, retrieval, or model invocation, and returns a deterministic conversational reply with no citations because no factual source was needed.

Google authentication is not Google web search. EduPulse keeps Google sign-in separate from knowledge retrieval. Public factual answers use administrator-approved text or public pages. The existing Crawl4AI-compatible gateway prepares safe public-page jobs for an external worker; it does not execute unchecked crawling inside the web server. An administrator must approve the resulting source before it can support visitor answers.

## Duplicate Chat Visual Verification

On 26 August 2026, desktop and mobile previews were checked after the landing-page change. The full-page public `ParentPolicyChat` no longer renders in the landing assistant section; that section now presents a compact invitation to use the single bottom-corner assistant. The floating launcher remains visible in the desktop lower-right corner and the mobile lower-right corner without introducing a second chat panel. The dedicated authenticated `ask` workspace route continues to retain its full-page chat for signed-in use.

## Single-Assistant Landing Verification

After the duplicate-render fix, full-page desktop and mobile previews show the landing assistant section as a compact explanatory panel rather than a second chat. The only persistent visitor chat control is the floating bottom-corner launcher. The responsive layout remains intact and the launcher does not create a second background conversation surface.

## Screenshot Phrase Regression

The reported input included the misspelled phrase `than lyou very much`. The conversation detector now treats that exact phrase, alongside `thank you very much`, `than you very much`, `thankyou`, and Arabic thanks variants, as a closing intent. The router returns the deterministic welcome reply before source retrieval, so it cannot reach the institutional no-source fallback.

## Deployment Comparison During Agent Audit

On 26 August 2026, the published Manus domain `edupulse-3uaxdfe5.manus.space` served the current EduPulse landing page with the single bottom-corner assistant. The user’s Render domain `edupulse-krcu.onrender.com` returned Render’s `Application loading` / `Service waking up` page instead of the application. Therefore, a harmful unrelated answer observed on Render may come from an older build or an incomplete service start; it cannot be treated as evidence of the current published code until Render finishes booting and the latest source is deployed there.

## Current Preview Verification

The current local preview loaded the complete landing page and exposed one visitor assistant launcher, with the knowledge section describing the same single-corner interaction. The Render URL remained on its service-waking page during this audit, so Render cannot yet be used to verify the latest agent routing.

## Complete Remediation Evidence

The current remediation adds deterministic public routing for platform/about, creator, enrolment, conversation, and protected-record intents. It adds a stopword-filtered retrieval score, rejects uncited or out-of-range model citations, and logs only intent, outcome, source count, and rounded latency. The supplied Public APIs and MCP catalogs informed the composable-action, structured-result, citation, and explicit-boundary patterns documented in `docs/agent-reference-adoption.md`; they are not runtime dependencies. The local suite now passes 44 tests. Live Render verification remains pending because the Render service was still showing its wake-up page.
