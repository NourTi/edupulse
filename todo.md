# EduPulse Expansion Checklist

- [x] Research comparable school, LMS, and student-information products and record the differentiated MVP scope.
- [x] Extend the local data model for roles, registration, school subjects, assessments, guardians, reports, and payments.
- [x] Build Arabic-first registration and profile workflows with RTL support.
- [x] Add role switching and distinct administrator, teacher, and student dashboard views.
- [x] Implement CEFR assessment tracking and a school-subject progress model.
- [x] Implement guardian communication drafts and printable progress reports.
- [x] Implement local payment entries and printable receipt generation.
- [x] Expand the landing/product experience into a meaningful scrollable experience with sections, navigation, and product explanation.
- [x] Verify desktop/mobile layout and production build; the local browser automation connector was unavailable for additional click-through testing.
- [x] Save final checkpoint and deliver the upgraded project.

## Knowledge Base and Education Agent

- [x] Define the approved document types, knowledge boundaries, and parent/student response policy from the uploaded notes.
- [x] Upgrade to a server-backed project for authenticated ingestion, document storage, and safe agent execution.
- [x] Add administrator-only knowledge-source ingestion for readable text files and approved public webpages.
- [x] Add the documented MinerU/Crawl4AI/LightRAG/RAG-Anything worker hand-off with a clear substitute path for the managed lightweight start.
- [x] Add retrieval storage, citations, source status, and access boundaries for school knowledge.
- [x] Add a grounded parent/student agent that refuses unsupported claims and redirects personal student-record questions to authenticated areas.
- [x] Add the administrator knowledge-base interface and the parent/student question interface.
- [x] Verify policy, retrieval, source status, access rules, unsupported-question behavior, type checking, and production build.

## Desktop Application Conversion

- [x] Define the first supported desktop targets, offline behavior, and local data boundaries.
- [x] Add the Tauri desktop scaffold and desktop permission configuration.
- [x] Add local application-data storage, export paths, and user-selected desktop backups.
- [x] Add clear desktop connection boundaries for online grounded answers and offline education workflows.
- [x] Verify the desktop web build path and write Windows installation guidance; a native installer must be built on Windows because this environment lacks Rust and Windows tooling.

## Windows Desktop and Search Repair

- [x] Replace the decorative search control with a clickable local-record search, keyboard shortcut, results, and direct navigation.
- [x] Add the Windows-focused Tauri application scaffold and package configuration.
- [x] Define desktop local-data, backup, and online AI-agent connection states.
- [x] Add the explicit Crawl4AI gateway contract and transition criteria from lightweight ingestion to the full worker.
- [x] Verify the updated search flow, app build, and Windows desktop build path.

## Parent AI Chat and Branded RTL Receipts

- [x] Add a parent-friendly Arabic-first AI policy chat surface with suggested questions, conversation history, loading, empty, and refusal states.
- [x] Wire the chat to the existing grounded knowledge endpoint with citations and privacy-safe boundaries.
- [x] Add administrator school identity settings and customizable logo handling through the authenticated storage backend, with a local-first fallback.
- [x] Improve payment receipt generation with school logo, bilingual metadata, Arabic RTL layout, and print/download controls using browser-shaped rendering.
- [x] Add tests for chat grounding/refusal behavior and receipt data formatting.
- [x] Verify chat entry and PDF download in the browser, responsive product layout at the mobile breakpoint, type checks, and production build; authenticated logo-upload persistence remains ready for a signed-in administrator.
- [x] Save and deliver the updated checkpoint.

## Desktop Runtime Follow-up

- [x] Add a reproducible Windows packaging workflow and installation guidance; native installer execution requires a Windows runner with Rust and WebView2 tooling.
