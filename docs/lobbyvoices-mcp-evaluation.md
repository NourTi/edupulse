# LobbyVoices MCP Evaluation

Repository: https://github.com/bodyegypt/lobbyvoices-mcp
Official developer documentation: https://lobbyvoices.com/developers
Remote MCP endpoint listed by the repository: https://lobbyvoices.com/api/mcp
OpenAPI reference listed by the repository: https://lobbyvoices.com/api/v1/openapi.json

## What it is

LobbyVoices MCP is a MIT-licensed Node.js stdio bridge to a remote receptionist toolkit. Its package metadata describes eight free, no-auth receptionist tools. The repository’s server manifest exposes a streamable HTTP MCP endpoint at `https://lobbyvoices.com/api/mcp`.

The tools are oriented toward business phone reception, not school information retrieval. The documented capabilities include generating phone scripts, voicemail scripts, bilingual English/Mexican-Spanish receptionist scripts, IVR menus, ElevenLabs receptionist prompts, missed-call cost calculations, simulated receptionist calls, receptionist coverage scoring, and an explicit-consent tool that saves a generated receptionist artifact and emails it to the user.

The repository README states that the remote service is no-auth and rate-limited. It describes AI-backed tools as limited to two requests per minute, with more generous limits for math and template tools. The service’s product is an AI front desk for small businesses that answers inbound calls, books appointments, captures leads, and switches between English and Mexican Spanish.

## EduPulse fit

This MCP is not suitable as a knowledge or search provider for EduPulse. It cannot improve the platform-answer accuracy problem, the RAG pipeline, Arabic school-policy retrieval, or citation grounding. Sending student, guardian, school, or account data to it would be inappropriate because its tools are unrelated to those records and the service is an external no-auth endpoint.

A limited optional use could exist later for an administrator-facing communication-template helper that drafts a generic school reception script or IVR menu. Such a helper must receive only a user-approved institution name, public contact details, and public service options. It must never receive student records, grades, attendance, fees, passwords, private contacts, or school-policy documents. The result would be a draft requiring administrator review; it would not be used to answer visitor questions or modify the grounded AI agent’s evidence.

## Decision

Do not connect LobbyVoices MCP to the public EduPulse agent or the school knowledge retrieval path. Keep the evaluation as a project reference. If a future administrator explicitly requests a receptionist/IVR-template feature, integrate only the documented template tools through a server-side, consent-gated adapter with timeouts, input caps, no private data, and a clear draft/review state.
