# EduPulse AI Agent Integration

## What the agent is

EduPulse uses a server-side grounded policy assistant. It is not a general unrestricted chatbot and it does not read private learner records. The welcome page renders `PublicKnowledgeAgent`, which reuses `ParentPolicyChat`.

## Request path

1. A visitor enters a question in `client/src/components/ParentPolicyChat.tsx`.
2. The component reads the public school identity from `trpc.school.brand` and sends the resolved `institutionId` with the question.
3. `knowledge.askPublic` in `server/routers.ts` rejects individual-record questions before retrieval.
4. `getPublicKnowledgeChunks` in `server/db.ts` selects only `ready` and `public` sources for the requested institution. If no institution context exists, it selects only intentionally global sources whose `institutionId` is null; it no longer searches every institution.
5. `retrieveRelevantChunks` ranks matching chunks by shared Arabic/English terms.
6. The server sends only the matching approved excerpts to `invokeLLM` in `server/_core/llm.ts`.
7. The system prompt requires the model to use only those excerpts, cite factual claims as `[S1]`, `[S2]`, and say when the evidence is insufficient.
8. The response returns the answer and deduplicated source references. The UI renders the citations as links when a source URL exists.

## How an institution makes it functional

An administrator first saves the institution brand settings. This associates the public school settings row with the institution ID. The administrator then uses Knowledge Administration to import reviewed text or a safe public webpage. The import is role-protected, stores the source and chunks, and marks the administrator-submitted source `ready` for retrieval. The public assistant receives that institution ID from the school-brand row and can then retrieve only that institution’s public sources.

The current managed lightweight webpage importer uses a server-side `fetch` plus readable-text extraction. `server/knowledge/crawl4aiGateway.ts` defines the versioned Crawl4AI-compatible worker hand-off for a later isolated crawler. It validates safe public URLs and normalizes worker output into citation-ready chunks. Crawl4AI does not answer visitors directly; it prepares source text for the same approved retrieval path.

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
