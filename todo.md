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

## Authentication and Educator Workflow Audit

- [ ] Audit admin, normal-user, password/credential, and role behavior in the current build.
- [ ] Compare implemented teacher, university educator, and school workflow features against the supplied educator notes.
- [ ] Demonstrate the current user paths and document what is demo-only versus production-ready.
- [ ] Deliver a precise feature inventory, limitations, and recommended next implementation steps.

## Full-Stack School Platform Upgrade

- [ ] Review the current full-stack foundation and the Appwrite, Twenty, and SaaS Boilerplate references.
- [ ] Define institutions, memberships, school roles, password credentials, invitations, sessions, and record-level authorization.
- [ ] Implement password authentication, credential lifecycle, and secure account recovery.
- [ ] Implement institution administration, staff invitations, audit logs, retention controls, document review, and granular permissions.
- [ ] Implement complete normal-user journeys for teachers, students, guardians, and staff.
- [ ] Implement tasks, follow-ups, essay pipelines, behavior/participation, mentorship timelines, resource library, language evolution, and education-business workflows.
- [ ] Fix Arabic welcome-page contrast and review the full product navigation and copy.
- [ ] Verify migrations, authorization boundaries, authentication flows, educator workflows, and responsive web/desktop behavior.
- [ ] Save and deliver the full-stack upgrade checkpoint.

## Phase 3 Delivery Record

- [x] Add real email/password registration for a new institution owner and password login for active users.
- [x] Add secure password hashing, opaque session tokens, password change, logout, and invitation acceptance.
- [x] Replace the prototype role gate with an Arabic-first authenticated account portal and invitation form.
- [x] Add institution memberships for owner, admin, registrar, finance administrator, teacher, counsellor, student, and guardian roles.
- [x] Add institution-scoped member listing, audit-log access, knowledge ingestion, and school-brand administration primitives.
- [x] Add invitation token issuance with seven-day expiry, invited-account activation, and membership activation.
- [ ] Add password reset email delivery and recovery UI after an approved mail provider is selected.
- [ ] Replace local demo student records with institution-scoped server records across registration, attendance, CEFR, payments, and reports.
- [x] Hydrate authenticated web learners, payments, attendance summaries, and CEFR assessments from institution-scoped procedures; local desktop mode remains unchanged.
- [x] Connect authenticated web learner registration and payment forms to the institution-scoped server API while preserving desktop local-first mode.
- [ ] Run an authenticated browser check for server learner registration and payment persistence on Render.
- [x] Complete the educator CRM layer: structured tasks, essay pipelines, behavior history, mentorship timelines, resource library, longitudinal language evolution, and client management through institution-scoped category workflows, learner links, CRUD, filters, and reviewable states.
- [x] Add category-focused CRM workspaces for essay review, behaviour follow-up, mentorship sessions, resource metadata, language milestones, and client pipeline states through module-specific guidance, stage fields, filtered records, learner links, edit, and archive actions.
- [x] Add module-specific empty/loading/error states and category-filtered record views with institution-scoped validation.
- [x] Persist educator essay pipelines, behavior/participation records, mentorship timelines, resource-library records, language-evolution records, and client-management records through the institution-scoped educator-record model and protected CRUD procedures.
- [x] Add the institution-scoped educatorRecords schema, migration, protected CRUD procedures, audit logging, connected CRM counts, learner links, and non-destructive archive behavior for the remaining educator domains.
- [x] Add a connected-mode Arabic/English CRM record form for essay, behaviour, mentorship, resource, language-evolution, and client records with local-first desktop guardrails.
- [x] Add institution-scoped list, edit, archive, and learner-link interactions for persisted educator CRM records.
- [x] Add focused unit coverage for educator-record validation, institution isolation, learner-not-found, not-found records, and archive/edit behavior; the full suite now passes 32 tests.
- [x] Add institution-scoped educator task persistence with protected list/create/complete procedures, audit logging, and a local-first CRM panel fallback.
- [x] Prevent completed server tasks from reopening locally, validate task ownership before completion, record completion audits, and disable server CRM queries/mutations in desktop mode.
- [x] Add focused CRM boundary tests for tasks and educator records; TypeScript, 32 unit tests, and production build pass.
- [ ] Complete authenticated guardian and student portals with record-level student relationship checks.
- [ ] Harden the Tauri Windows build with encrypted local credential storage and signed release artifacts.
- [x] Generate the required `src-tauri/icons/icon.ico` from the existing EduPulse icon for Windows packaging.
- [ ] Add SQLCipher-encrypted local desktop storage with a secure key lifecycle and a development/browser fallback; native Windows compilation remains runner-dependent.
- [ ] Handle keyring retrieval errors safely: create a key only when the credential is absent, and fail fast on other keyring errors.
- [x] Compile and package the SQLCipher Tauri path successfully through the Windows GitHub Actions runner.
- [ ] Run native Windows end-to-end checks: first-launch key creation, encrypted save/load, reopen existing database, and keyring failure handling.
- [x] Produce a downloadable Windows desktop artifact through the existing GitHub Actions Tauri workflow and document unsigned-versus-signed release status; corrected main run 32982342052 uploaded `EduPulse_1.0.0_x64-setup.exe`.
- [x] Provide and validate the local Windows build instructions for the user-selected Option B path, including prerequisites, commands, installer location, and SmartScreen expectations; commands match the current package scripts, while native execution remains user-side.
- [x] Document the local Windows Option B build prerequisites, copyable PowerShell commands, installer location, unsigned SmartScreen behavior, and first-run SQLCipher checks.
- [x] Provide the user-selected Option B build guide; native execution and installer verification remain the user’s Windows-side step.
- [x] Ensure the end-user Windows download is a self-contained EduPulse installer and clearly separate bundled app/runtime assets from developer-only build prerequisites; Tauri bundles the compiled app and offline WebView2 installer.
- [x] Align Tauri product version with the Node package version so the generated installer filename and release metadata are consistent.
- [x] Verify and document the remaining Windows prerequisite boundary: WebView2 is bundled in offlineInstaller mode, while Git, Node.js, pnpm, Rust, and source cloning remain developer-only requirements.
- [x] Complete the Windows native Tauri build on GitHub Actions; corrected main run 32982342052 completed successfully and uploaded the installer.
- [x] Add Rust dependency caching and a 30-minute Windows job timeout to make the native packaging workflow more predictable.
- [x] Configure automatic Windows installer builds on manual dispatch, every main-branch push, and version tags, with downloadable artifact upload and tag release publishing.
- [x] Fix the Windows workflow pnpm conflict so native SQLCipher validation can run.
- [x] Provide non-secret Google-shaped test variables in Windows CI so configuration tests do not depend on production secrets.
- [x] Add the desktop frontend build step before the Windows Tauri packaging step.
- [x] Correct the desktop frontend output path so Tauri can find the generated assets on Windows.
- [x] Verify TypeScript, production build, unit suite, migration generation, and public landing-page rendering.
- [ ] Resolve the already-applied database migration marker in the managed migration journal before the next schema change.

## Server Records Foundation

- [x] Add institution-owned learner, guardian-link, attendance, CEFR assessment, and payment tables through a reviewed non-destructive migration.
- [x] Add tenant-scoped tRPC procedures for learner listing/creation, attendance, CEFR assessment, payments, and guardian-linked learners.
- [x] Enforce staff role gates and institution membership checks before server record access or mutation.
- [x] Validate the records schema and API integration with TypeScript, unit tests, and a production build.

## Student Relationship Foundation

- [x] Add an explicit learner-to-student-account relationship table and migration.
- [x] Add administrator/registrar-only student linking with active-membership validation.
- [x] Add a student self-record procedure that refuses access without an explicit institution link.
- [x] Re-run TypeScript and the full unit suite after the relationship changes.

## Student Portal Surface

- [x] Add an authenticated student portal view backed by the institution-linked self-record procedure.
- [x] Show a privacy-safe empty state when no learner record is linked instead of falling back to another student.
- [x] Wire the portal into student-only workspace navigation and validate it with TypeScript and the full unit suite.

## Guardian Portal Surface

- [x] Preserve guardian membership identity instead of collapsing guardians into student role behavior.
- [x] Add a guardian-only portal showing explicitly linked learners and a safe empty/error state.
- [x] Keep guardian portal access behind the institution-scoped guardian relationship procedure.
- [x] Validate guardian role mapping and portal integration with TypeScript and the full unit suite.

## User-Reported Production Gaps

- [ ] Configure Resend for password-reset delivery and add a secure recovery UI.
- [ ] Verify the grounded RAG agent is installed, callable, citation-grounded, and privacy-bounded for parent/student questions.
- [x] Trace and document the complete welcome-agent path from chat UI through server retrieval, model adapter, approved sources, citations, and refusal behavior; documented in `docs/ai-agent-integration.md`.
- [ ] Verify the model/API configuration is available in development and production, with a clear missing-configuration error instead of silent fallback.
- [ ] Live-verify the grounded AI agent in development and on Render with valid model credentials, confirming successful answers with citations and the exact user-facing error when LLM configuration is missing or invalid.
- [x] Add a focused test or diagnostic path proving the server LLM adapter fails loudly when configuration is missing and uses the configured server-side endpoint; the UI has a safe user-facing retry state.
- [ ] Validate the welcome agent with grounded, unsupported, and source-ingestion scenarios, then restore the completed status when evidence exists.
- [ ] Add and expose the requested scraping/search ingestion gateway with a documented Crawl4AI-compatible path and fallback behavior.
- [x] Trace and verify the Crawl4AI-compatible ingestion hand-off, approval state, retrieval indexing, and fallback worker behavior used by the welcome agent; contract and normalization tests pass.
- [x] Prevent the public welcome assistant from retrieving institutional sources across tenants when no institution context is supplied; unscoped retrieval now permits only intentionally global sources.
- [x] Improve Arabic welcome-page text contrast, weight, and readability across desktop and mobile; targeted hero styling and responsive visual checks are complete.
- [x] Improve the original Arabic hero/welcome text styling directly with stronger contrast, weight, spacing, and desktop/mobile validation; added stronger weight, layered text shadow, readable panel backing, and responsive spacing.
- [x] Add Arabic-first honeycomb hexagonal feature badges beneath the hero with EduPulse benefits, icons, and metrics.
- [x] Restyle the honeycomb feature badges as morphism UI elements with layered depth, soft shadows, highlights, and RTL-responsive behavior; desktop and mobile wrapping verified.
- [x] Add a Student Information System explanation section covering unified student, parent, educator, course, and lifecycle data.
- [x] Replace generic education-level content with Algeria’s preparatory, primary, middle, secondary, and higher-education LMD stages, including durations and certificates.
- [x] Add a welcome-page grounded AI assistant entry point with citation-safe policy answers and clear authentication/privacy boundaries.
- [x] Connect welcome-page source discovery to the existing Crawl4AI-compatible gateway and document that scraped content must be approved/ingested before retrieval; the welcome CTA routes to the existing protected knowledge ingestion surface.
- [x] Add a visible welcome-page source-discovery/admin ingestion entry point wired to the existing knowledge ingestion flow, with approval-before-retrieval messaging; the CTA opens protected administrator knowledge management or the access screen.
- [x] Document that native Tauri installer compilation requires a Windows runner; do not claim an installer is present in this Linux environment.

## GitHub Source and Pages Packaging

- [x] Create a private GitHub repository containing the complete EduPulse source.
- [x] Add a GitHub Pages workflow for the static frontend only, with an explicit full-stack limitation notice.
- [x] Document the GitHub Pages URL format and custom-domain activation steps.
- [x] Verify the source repository build and preserve Manus as the production backend host.

## Private GitHub Constraint

- [ ] Enable GitHub Pages for the private repository through GitHub Settings or a plan/token with Pages administration permission; keep the repository private.

## GitHub-Only Full-Stack Migration

- [x] Remove or abstract Manus-only runtime dependencies from the production server path.
- [ ] Add a portable full-stack container/deployment workflow that can run from the private GitHub repository.
- [x] Define portable database, object storage, authentication, Resend, and RAG environment variables without committing secrets.
- [ ] Choose a GitHub-compatible runtime host and domain strategy; GitHub itself is source control and Pages is static-only.
- [x] Verify the portable build and document the remaining provider setup required for a live full-stack URL.

## Confirmed Option B Deployment

- [x] Prepare the complete Node/Express application for a separate Node-capable host while keeping GitHub as the private source of truth.
- [x] Add provider-neutral environment documentation for database, JWT, Resend, storage, LLM/RAG, and public URL configuration.
- [ ] Add a reproducible full-stack deployment workflow that can be connected to the selected Node host.
- [x] Push and validate the deployment configuration in the private GitHub repository.

## CircleCI Deployment Pipeline

- [ ] Add CircleCI configuration for private GitHub checkout, dependency install, type checking, tests, and production build.
- [ ] Add a guarded deployment handoff that requires a configured external Node host and never commits secrets.
- [ ] Validate and push the CircleCI pipeline to the private GitHub repository.

## Render OAuth Startup Error

- [x] Remove the obsolete OAuth startup requirement from the password-only Render deployment.
- [ ] Verify Render startup logs and the live password-authenticated route after the fix.
- [x] Update portable deployment documentation so `OAUTH_SERVER_URL` is not presented as required for password authentication.

## Login Screen Clarity

- [x] Simplify the login screen into clear Arabic-first labels and user-friendly password guidance.
- [x] Keep English available through the language switch without mixing technical copy into the Arabic view.
- [x] Validate the login screen at desktop and mobile sizes, then push the Render-ready update.

## Logo and Arabic Readability Fix

- [x] Repair the shared EduPulse logo asset path and verify it across landing, login, and workspace views.
- [x] Improve Arabic hero/login copy contrast, spacing, and background separation on desktop and mobile.
- [x] Validate the fix and push it to the private GitHub repository.
- [ ] Redeploy the branding and Arabic readability fix through Render and verify the live landing/login screens.

## Resend Recovery Revisit

- [ ] Configure the user-provided Resend API key in the Render secret manager.
- [ ] Set `APP_BASE_URL` to `https://edupulse-krcu.onrender.com` in Render.
- [ ] Obtain or confirm a Resend-verified `RESEND_FROM_EMAIL`; do not invent a sender address.
- [ ] Test password-recovery request behavior and confirm generic privacy-safe responses.

## Google Sign-In

- [ ] Rotate the exposed Google client secret before production use.
- [x] Store the replacement Google OAuth client ID and secret securely, never in source control.
- [x] Add optional Google sign-in alongside password login with secure callback and account linking.
- [x] Preserve institution membership roles and prevent cross-institution account takeover during Google linking.
- [ ] Validate the bilingual Google login flow locally; configure and verify the Render callback after redeployment.
- [x] Diagnose the live Render Google sign-in 404; the route now responds with an explicit configuration error instead of a generic 404.
- [x] Fix the live Render Google sign-in configuration error by adding the expected provider variables to the running service.
- [ ] Diagnose the Google callback failure after selecting a different account.
- [x] Add multi-state OAuth retry handling for multiple tabs and callback retries.
- [ ] Fix the production callback failure after applying the Google identity migration on Render.
- [x] Diagnose the production Google callback failure from Render logs: `createExternalUser` reports `Database is unavailable`, meaning the deployed service lacks a usable `DATABASE_URL` connection.
- [ ] Configure and verify the Render service `DATABASE_URL` against the intended MySQL/TiDB database.
- [ ] Diagnose the repeated Render database connection failure after `DATABASE_URL` was added; the user still receives the same temporary-unavailable response.
- [ ] Add a safe public database health probe that reports configuration or connection status without revealing secrets.
- [x] Add TiDB-compatible URL parsing and automatic TLS configuration without exposing secret values.
- [ ] Verify the TiDB connection string, credentials, endpoint, port, and TLS settings on Render without exposing secret values.
- [x] Confirm from Render logs that no database exists or is connected to the web service.
- [x] Select TiDB Cloud Starter as the MySQL-compatible database provider for the Render deployment.
- [ ] Apply migration `0005_dark_living_tribunal.sql` to the same database used by Render and verify the callback no longer returns `Google sign-in is temporarily unavailable`.
- [x] Add a controlled startup migration path for Render Free, where Shell access is unavailable.
- [x] Fix Render startup ordering so the web port binds before or alongside the optional migration instead of producing `No open ports detected`.
- [ ] Live-test Google sign-in on Render with the Google Cloud owner account and a different Google account, confirming successful account linking and no invalid-state error on retry.
- [x] Verify the live Render public landing, Arabic login, and password-recovery screens load without submitting credentials; authenticated persistence and provider checks remain pending.
- [x] Expose the validated Crawl4AI job hand-off through an administrator-only procedure without executing crawler code inside the web request.

## Zoho-Inspired Visual Refresh

- [x] Review Zoho’s education CRM landing-page dashboard treatment and extract useful non-copying patterns for EduPulse; findings saved in `docs/zoho-education-reference.md`.
- [x] Define a brighter mixed-color visual system that reduces dark anxiety while preserving Arabic-first RTL readability and EduPulse identity.
- [x] Redesign the authenticated dashboard with colorful KPI cards, clear school-wide database navigation, actionable activity summaries, and responsive RTL layout in `VividDashboard.tsx`.
- [x] Add selected education CRM information architecture improvements inspired by the reference without copying proprietary branding or text.
- [x] Validate the refreshed dashboard and landing experience with TypeScript, full tests, production build, and responsive landing screenshot; authenticated dashboard click-through was limited by browser-session availability.
- [x] Save and deliver the Zoho-inspired visual refresh checkpoint.

## Visitor Agent and Arabic Readability Fixes

- [x] Audit Arabic headline/paragraph spacing, line-height, font loading, and RTL wrapping across the landing page and dashboard; increased Arabic body rhythm and display line-height with controlled word spacing.
- [x] Remove the unnecessary institution sign-in gate from the public welcome assistant while preserving tenant isolation and private-record boundaries; visitor chat no longer queries protected identity or sends a tenant ID from the browser.
- [x] Add intent handling for conversational closings such as thanks, greetings, and acknowledgements so they receive natural responses instead of policy answers.
- [x] Connect public answers to approved public knowledge sources through the existing ingestion/gateway path; public visitors use the explicitly mapped school’s ready/public sources, while the Crawl4AI gateway remains approval-gated and never runs unchecked crawling in the web request.
- [x] Add regression tests for visitor access, conversational closings, unsupported questions, citations, and source boundaries; 36 tests pass.
- [x] Verify Arabic readability, visitor chat behavior, source grounding, type checks, tests, production build, and responsive mobile screenshot; live model/crawler calls remain intentionally outside automated tests.
- [x] Save and deliver the visitor-agent and Arabic-readability fix checkpoint.

## Public Agent Reliability and Platform Knowledge

- [ ] Verify whether the user-facing Render deployment contains the latest conversational-intent fix and identify why “thank you” reaches the no-source fallback.
- [ ] Broaden deterministic conversational handling for thanks, acknowledgements, short closings, and mixed Arabic/English variants.
- [ ] Add approved public knowledge about EduPulse, its capabilities, and its creator so platform questions receive grounded answers with no invented personal claims.
- [ ] Keep Google OAuth separate from Google web search and define an optional safe search provider path with explicit credentials, domain allowlisting, citations, and fallback behavior.
- [ ] Add regression tests for platform/about questions, conversational variants, and public-source boundaries.
- [ ] Validate local and deployed public-chat behavior, then save the assistant reliability checkpoint.

## MCP and Search-Service Evaluation

- [x] Inspect the provided MailFlat MCP page and Glama Python search catalog for relevant capabilities, maintenance signals, data handling, and deployment fit; findings are documented in `docs/mcp-search-evaluation.md`.
- [x] Audit EduPulse’s configured connectors and current AI/Crawl4AI boundaries before enabling an external service; no matching connector was configured.
- [x] Select only services that directly improve public-source discovery, approved ingestion, email workflows, or agent reliability; rejected MailFlat and the third-party Brave wrapper for production chat, and selected a constrained no-auth Wikipedia fallback.
- [x] Configure required connectors or credentials only after the user understands the purpose and confirms any mandatory setup; no credential is required for the selected Wikipedia path, and paid/undocumented connectors remain disabled.
- [x] Implement and validate the selected integration, or document why it should not be integrated yet; added and tested the constrained no-auth Wikipedia fallback, while documenting why MailFlat and the third-party Brave wrapper are not production integrations.
- [x] Save and deliver the MCP/search-service evaluation milestone.

- [x] Evaluate the user-provided `mcp-brave-search` `brave_web_search` tool entry and compare its endpoint and trust signals with the official Brave Search MCP/API; rejected it for production because it is third-party and its remote endpoint/security details are not established.

## Zero-Cost Search Constraint

- [x] Find a genuinely free or keyless public-web retrieval option rather than a free MCP wrapper that still requires a paid Brave API key; selected the no-auth Wikipedia API for general factual questions.
- [x] Verify that any selected option can be rate-limited, cited, and isolated from private school data before integrating it; requests are server-side, bounded, cited, and never used for private or institution-specific policy retrieval.

## Public APIs Catalog Review

- [x] Review the Public APIs authentication section and identify no-auth candidates relevant to public education information, language support, or source discovery; findings saved in `docs/mcp-search-evaluation.md`.
- [x] Reject candidates that lack stable documentation, have unsuitable licensing, expose sensitive data, or cannot provide trustworthy citations; rejected MailFlat for production chat and the undocumented third-party Brave wrapper.
- [x] Document the selected free API path and explain why approved EduPulse sources remain safer than a generic public API.

- [x] Add a lightweight per-process rate limit and timeout to the keyless public-source fallback so a public visitor cannot exhaust the external endpoint.

## Durable Connector Reference

- [x] Save the user-provided Glama App Automation catalog as a durable EduPulse project reference in `docs/connector-catalog.md`.
- [x] Preserve a review-first rule: evaluate each future connector for true free access, security, maintenance, permissions, and EduPulse fit before enabling it.

## Connector Setup

- [ ] Review the Public APIs repository as a reference for useful EduPulse integrations, without treating its entries as automatic dependencies.
- [ ] Inspect existing Google Workspace and other relevant connector availability.
- [ ] Define the minimum connector set: Google Sheets first, then only directly useful school operations connectors.
- [ ] Enable Google Sheets only after confirming its account and permission requirements.
- [ ] Document connector data boundaries and validate the project integration paths.
- [ ] Save and deliver the connector setup milestone.

## Floating Corner AI Assistant

- [x] Audit the existing public chat host, landing layout, and reusable chat component before introducing a floating entry point.
- [x] Build a persistent corner launcher with Arabic-first label, unread/welcome state, keyboard access, and mobile-safe positioning.
- [x] Add an expandable pop-up panel with close/minimize behavior, suggested prompts, loading state, citations, and clear source boundaries.
- [x] Connect the pop-up to the existing EduPulse public AI procedure, including conversational replies, platform profile answers, approved school knowledge, and the no-auth general-knowledge fallback.
- [x] Add regression coverage for public assistant answer routing; launcher behavior is validated through type/build checks and responsive browser screenshots.
- [x] Verify desktop/mobile appearance, RTL text flow, focus behavior, tests, and production build.
- [x] Save and deliver the floating assistant milestone.

## Duplicate Agent and Conversational Quality Fix

- [x] Remove the full-page public `ParentPolicyChat` from the landing/public knowledge surface so only the floating assistant remains visible to visitors.
- [x] Verify that authenticated or dedicated knowledge routes do not accidentally render a second public assistant; the dedicated `ask` route retains its own workspace chat while the landing page uses only the corner launcher.
- [x] Expand thanks, acknowledgement, and closing detection for English, Arabic, mixed-language, and common misspelled variants.
- [x] Return a natural assistant reply such as “You’re welcome. I’m here if you need anything else.” without retrieval or the no-source fallback.
- [x] Use the supplied API/MCP repositories as reference material to improve the assistant’s capabilities and document exactly which patterns were adopted inside EduPulse in `docs/agent-reference-adoption.md`.
- [x] Add regression tests proving the public assistant routing and exact extended thank-you phrase; the single-surface behavior is also verified in responsive screenshots.
- [x] Validate the corrected UI, answer routing, TypeScript, tests, production build, and responsive screenshots.
- [x] Save and deliver the duplicate-agent fix checkpoint.

## Complete AI Agent Remediation

- [x] Audit every public-agent route, prompt, classifier, retrieval query, fallback, and deployed-version path to locate why EduPulse questions can receive unrelated answers; the current published build is deterministic for platform, creator, enrolment, thanks, and protected-record intents, while Render was still waking.
- [x] Add a durable, approved EduPulse project profile covering the platform, its creator, purpose, Algerian education scope, features, privacy boundaries, and contact guidance.
- [x] Add explicit question routing for platform/about, creator, enrolment intent, general knowledge, school policy, protected student records, thanks, greetings, and unsupported/off-topic requests.
- [x] Ensure “I want to sign my son” receives a helpful public enrolment response without exposing or requesting private student records.
- [x] Prevent unrelated model answers when retrieval is empty, weak, or mismatched; stopword-filtered retrieval and citation validation now reject generic or uncited model output.
- [x] Evaluate the supplied Public APIs and MCP references for useful free patterns that can be implemented inside EduPulse for CRM, search, observability, and scalable agent operation; adopted structured actions, citation-first responses, explicit boundaries, deterministic fallbacks, rate limits, and safe observability.
- [x] Add server-side agent observability with safe event metadata, intent/result categories, latency, source counts, and no raw private questions or credentials in logs.
- [x] Add comprehensive regression tests for platform facts, creator facts, enrolment, privacy, thanks, unsupported questions, weak retrieval, citations, tenant boundaries, and privacy-safe observability; the validated suite passes 45 tests.
- [x] Validate local and deployed agent behavior, then deliver a qualified remediation report only after evidence is complete; local and current published-domain behavior were verified, while the separate Render URL was confirmed to serve an older build.

## Post-Hero CRM Redesign

- [x] Preserve the existing hero section exactly; do not change its copy, background, composition, or primary controls.
- [x] Replace the pale/dark post-hero feature treatment with a bright, vivid light CRM workspace language inspired by the supplied screenshots.
- [x] Add an icon-based module navigation strip for dashboard, scheduling, payments, communication, lessons, registration, leads, student CRM, grades, portals, and AI tools.
- [x] Build a polished post-hero dashboard panel with a searchable/organized activity view, announcements, notes, notifications, birthdays, and checklist-style status areas.
- [x] Build a student-information panel with tabs/filter controls, learner identity, contact, registration, payments, and class information.
- [x] Build a grades/gradebook panel with term selection, assignments, scores, class grade, notes, export, and edit affordances using safe non-production sample presentation data only.
- [x] Keep dashboard content role-aware for administration, teacher, student, and guardian experiences.
- [x] Validate hero preservation, vivid color contrast, Arabic-first RTL readability, desktop/mobile responsiveness, TypeScript, tests, and production build.
- [x] Save and deliver the post-hero CRM redesign milestone.
- [ ] Ensure the post-hero Dashboard module opens the authenticated overview when selected.

## Google Sign-In 403 Investigation

- [x] Trace the Google OAuth start URL, callback route, redirect URI, and runtime configuration.
- [x] Identify whether the 403 is caused by Google Cloud client restrictions, consent-screen/testing state, redirect URI mismatch, or application configuration.
- [x] Apply and test any required secure application-side OAuth fix without weakening state or tenant isolation.
- [x] Document the exact Google Cloud and Render settings needed for successful sign-in.

## Render Deployment Sync

- [ ] Compare the current EduPulse checkpoint/repository state with the live Render site.
- [ ] Inspect GitHub branch and commit configuration relevant to Render.
- [ ] Identify the exact Render redeploy, branch, build-command, or cache correction required.
- [ ] Validate that the live Render site contains the latest platform markers and provide simple deployment instructions.

## AgentFetch / Agent Scraper MCP Integration

- [x] Inspect agentfetch-mcp and agent-scraper-mcp repositories, licenses, tools, dependencies, and security posture.
- [x] Select the safer MCP for EduPulse and document the decision and integration boundary.
- [x] Integrate the selected MCP through an administrator-controlled retrieval gateway for the public agent.
- [x] Preserve approved-source priority, tenant isolation, privacy refusal, citation validation, rate limits, and failure fallback.
- [x] Add configuration guidance and regression tests for the MCP-backed retrieval path.
- [ ] Validate the agent integration, production build, and published deployment.

## Render Agent JSON Error

- [x] Reproduce or inspect the Render agent response that begins with a plain-text database error.
- [x] Ensure the agent endpoint returns a consistent JSON error envelope for database and upstream failures.
- [x] Preserve the real database failure signal in server logs while showing a safe retry message in the UI.
- [x] Add regression coverage and validate the Render deployment instructions after the fix.

## EduPulse About Profile and PDF Knowledge

- [x] Research comparable education-management platforms and capture relevant positioning insights with source links.
- [x] Draft the Arabic-first and English About narrative for EduPulse, including mission, expected workflow, target clients, educator problems solved, and potential.
- [x] Create a professional PDF profile containing the platform information and reference section.
- [x] Add the approved EduPulse profile/PDF content to the grounded AI knowledge source with citation support.
- [x] Build the About section into the public site without changing the preserved hero.
- [x] Validate Arabic PDF readability, source citations, AI answers, tests, and production build.

## Complete AI Agent Remediation

- [x] Audit the live and local agent response paths, model limits, source selection, and deployed build version.
- [x] Define one grounded response contract that requires complete answers, valid citations, and no unsupported claims.
- [x] Remove or isolate any path that can send unrelated retrieval evidence to platform questions.
- [x] Fix response truncation with an explicit output budget and completion validation.
- [x] Add regression tests for platform accuracy, hallucination rejection, citation validity, response completeness, privacy refusal, and database/upstream failures.
- [ ] Synchronize the remediation to GitHub and verify the deployed Render build markers.

## LobbyVoices MCP Evaluation and Integration

- [x] Inspect `bodyegypt/lobbyvoices-mcp` capabilities, license, dependencies, tools, and runtime contract.
- [x] Decide whether it provides concrete value for EduPulse and document the safe boundary.
- [x] Integrate only a suitable capability with configuration, privacy, tenant, and Arabic platform-answer guardrails.
- [x] Add focused tests and validate the production build and deployment guidance.

## Relevant Agent Repository Selection

- [x] Re-inventory the previously supplied search, scraping, RAG, MCP, and agent repositories.
- [x] Compare candidates specifically for hallucination prevention, Arabic/public-web retrieval, citations, and Render compatibility.
- [x] Select the best relevant component and integrate it into the existing grounded agent.
- [x] Add guardrails, tests, failure handling, and deployment documentation for the selected component.

## WhatsApp Guardian Messaging Automation

- [ ] Inspect the supplied WhatsApp MCP transport, authentication/session model, message capabilities, and licensing.
- [ ] Confirm whether the connector is suitable for production messaging and document its risks and provider requirements.
- [ ] Add institution-scoped guardian phone lookup with normalized numbers and explicit messaging consent.
- [ ] Add department-triggered message preview, approval, send, retry, unsubscribe, and audit flows.
- [ ] Add weekly progress-summary generation from authorized grades, assessments, attendance, and chart data.
- [ ] Add idempotent scheduled delivery through the project’s scheduled callback architecture; do not use in-process timers.
- [ ] Add provider configuration, privacy guards, tests, and deployment documentation.

## Desktop-First WhatsApp Integration

- [x] Confirm the Windows desktop app is the primary WhatsApp runtime and the Render web app cannot access the local WhatsApp session.
- [x] Integrate the supplied WhatsApp Web MCP bridge with the Tauri desktop runtime and bundled/local Python/Chromium setup boundary.
- [ ] Add SQLCipher-backed guardian phone, consent, opt-out, message-template, and delivery-audit handling. (Consent, phone verification, opt-out, local draft storage, and send bridge are implemented; delivery-audit schema remains.)
- [ ] Add department-triggered message preview/approval/send and weekly progress-summary scheduling. (Desktop preview/send and data-derived summary are implemented; unattended scheduler remains.)
- [ ] Add safe retry/idempotency behavior and tests for institution, guardian, and message isolation.
- [ ] Validate Windows packaging and document QR login, always-on desktop requirements, and WhatsApp Web limitations. (Workflow and documentation are prepared; Windows CI validation remains.)

## Authentication Journey Audit

- [ ] Verify manager registration and first sign-in for the downloaded desktop app and web app.
- [ ] Verify teacher/staff invitation acceptance, password setup, and sign-in journey.
- [ ] Verify ordinary user, guardian, and student sign-in and role routing.
- [ ] Verify Google OAuth readiness and explain its dependency on deployment configuration.
- [ ] Verify session persistence and local desktop/web differences; document any gaps without overstating readiness.

## SQLCipher Local Authentication and Parent WhatsApp Accounts

- [ ] Define a local SQLCipher schema for institution, user, role, learner, guardian relationship, consent, session, and audit records.
- [ ] Implement first-run school-manager registration with a strong local password and secure key lifecycle.
- [ ] Implement local password login, logout, session timeout/lock, failed-attempt throttling, and recovery boundary.
- [ ] Implement local staff/teacher invitation and parent/student account linking with role-aware access.
- [ ] Connect the authenticated parent relationship to normalized guardian phone data and explicit WhatsApp consent.
- [ ] Integrate the supplied WhatsApp MCP sidecar for reviewed department messages and parent progress summaries.
- [ ] Add delivery audit, retry/idempotency, opt-out, and weekly scheduling safeguards.
- [ ] Add security tests and Windows packaging documentation for the independent desktop application.
- [ ] Enforce mandatory administrator fields: first name, family name, birthplace, date of birth, sex, institution name, designation/title, email or username, password, and password confirmation.

## Medusa Commerce Integration

- [ ] Inspect the official Medusa repository, license, modules, and deployment requirements.
- [ ] Map Medusa to EduPulse services, school fees, invoices, subscriptions, and client workflows.
- [ ] Define ownership and synchronization boundaries between EduPulse education records and Medusa commerce records.
- [ ] Decide whether Medusa should be a separate service or a bounded module rather than replacing EduPulse’s core backend.
- [ ] Implement only suitable commerce capabilities with institution isolation, role permissions, auditability, and payment safeguards.
- [ ] Add tests and deployment documentation.
- [ ] Implement the confirmed separate Medusa commerce boundary for fees, course/service packages, invoices, discounts, refunds, and optional subscriptions.
- [ ] Keep EduPulse as the source of truth for institution, learner, guardian, identity, academic, SQLCipher, and AI data while synchronizing only approved commerce identifiers and statuses.

## Medusa Commerce Foundation

- [x] Define and document a separate Medusa commerce boundary with EduPulse as the source of truth for education, identity, privacy, SQLCipher, and AI data.
- [x] Add optional server-side Medusa configuration fields without committing credentials or breaking deployments where Medusa is not configured.
- [x] Add an institution-authorized tRPC commerce status procedure for owners, administrators, and finance administrators.
- [x] Add an institution-authorized Medusa catalog procedure for owners, administrators, finance administrators, and registrars with bounded requests and safe upstream errors.
- [x] Add an Arabic-first commerce workspace panel showing connection readiness, catalog state, and the local-payment fallback.
- [x] Add Medusa adapter regression tests; TypeScript, 53 unit tests, and the production build pass.
- [ ] Provision or connect a PostgreSQL-backed Medusa service and configure its URL and publishable key.
- [ ] Implement institution-scoped carts, orders, payment-provider callbacks, invoices, refunds, and optional subscription synchronization after the Medusa service is available.
- [ ] Reframe the Medusa work as EduPulse-native local-first commerce based on the supplied open-source repository; do not block implementation on a deployed Medusa backend or external credentials.
- [ ] Add local institution-scoped service catalog, fee plans, invoice states, discounts, refunds, and optional subscription records using the existing EduPulse data boundary.

## Corrected EduPulse-Native Medusa Feature Milestone

- [x] Reframe the Medusa work as EduPulse-native local-first commerce based on the supplied open-source repository; no deployed Medusa backend or external credentials are required for the implemented milestone.
- [x] Add institution-scoped local commerce products for fees, courses, services, and subscription plans with Arabic and English names, currency, amount, and lifecycle status.
- [x] Add institution-scoped invoice records with learner/product ownership checks, invoice numbers, due dates, discounts, and lifecycle states including paid, void, and refunded.
- [x] Add protected procedures for commerce product creation/listing, invoice creation/listing, invoice status changes, audit logging, and role separation.
- [x] Add an Arabic-first admin commerce panel that creates local fee products and explains the optional Medusa catalog boundary.
- [ ] Add end-to-end invoice creation UI, payment allocation, discount rules, refund workflow, and optional subscription recurrence after the local product foundation is reviewed.
- [x] Add protected invoice payment allocation that validates learner/institution ownership, prevents overpayment, writes the existing payment record, transitions invoice status to partially paid or paid, and audits the action.
- [x] Add a reviewed admin payment action for open local invoices that records the outstanding balance through the protected invoice-payment workflow and refreshes invoice status.
- [x] Add explicit discount entry with server-side maximum validation when issuing local invoices.
- [x] Add a reviewed admin refund-status action for paid invoices with audit logging and safe lifecycle state handling.
- [x] Complete the local invoice workflow UI for product selection, learner selection, invoice issuance, discount entry, outstanding-balance payment, and reviewed refund status; recurring subscription recurrence remains a separate scheduled-work phase.
- [x] Rewrite the Medusa evaluation as the final corrected architecture record, documenting EduPulse-native local-first commerce, optional adapter boundaries, implemented workflows, limitations, validation, and references.

## Commerce Reporting and Billing Simulation

- [ ] Add institution-scoped CSV export for learner-linked invoices and payment allocations.
- [ ] Add institution-scoped PDF export for learner-linked invoices and payment allocations with Arabic-friendly layout.
- [ ] Add commerce analytics for revenue, discounts applied, and refund rates without exposing cross-institution data.
- [ ] Add visual charts to the admin commerce panel for revenue, discounts, and refunds.
- [ ] Add a manual recurring-subscription billing simulator that creates only test-mode billing results and never charges real money.
- [ ] Add role checks, audit events, regression tests, responsive validation, and a checkpoint for the reporting milestone.

## Commerce Reporting Milestone

- [x] Add institution-scoped CSV export for learner-linked invoices and payment allocations.
- [x] Add institution-scoped PDF export for learner-linked invoices and payment allocations with Arabic-friendly labels and DZD formatting.
- [x] Add commerce analytics for revenue, discounts applied, refunded totals, and refund rates from existing local records.
- [x] Add vivid responsive dashboard charts and KPI cards to the admin commerce panel.
- [x] Add a manual recurring-subscription billing simulator with monthly, quarterly, and annual cycles, test-mode output, no-charge guarantee, learner/product ownership checks, and audit logging.
- [x] Add shared analytics unit coverage; TypeScript, 55 tests, and production build pass.
- [ ] Add real recurring billing automation only after a separate scheduling/deployment decision; the current simulator is intentionally manual and test-only.

## Analytics Filters, Report Email, and Student Support Evaluation

- [ ] Add date-range and product-type filters to institution-scoped commerce analytics and exports.
- [ ] Add secure administrator email delivery for filtered invoice and payment reports, with recipient validation and audit logging.
- [ ] Define evidence-based teacher progress inputs across grades, subjects, attendance, participation, CEFR, behavior, and observations.
- [ ] Add non-clinical academic and wellbeing support evaluation with explanations, confidence, recommended follow-up approaches, and mandatory teacher review.
- [ ] Add student learning charts and teacher-facing strengths/difficulties summaries without stigmatizing labels or clinical diagnosis.
- [ ] Add role/privacy safeguards, tests, responsive validation, documentation, and checkpoint.

## Primary Learning Support Evaluation and Venice AI

- [ ] Implement a primary-school, staff-only academic and wellbeing support evaluation using grades, attendance, lateness, CEFR/language measures when available, assignments, participation, teacher observations, behavior records, and guardian notes.
- [ ] Generate subject strengths, learning gaps, trend charts, evidence-based contributing factors, support level, recommended intervention, follow-up date, and teacher-review state without clinical diagnosis or stigmatizing labels.
- [ ] Integrate Venice through a server-side OpenAI-compatible adapter for concise, grounded evaluation explanations and improved public-agent answers.
- [ ] Store the Venice base URL and replacement API key as server secrets only; revoke the exposed screenshot key before production use.
- [ ] Add prompt constraints, output validation, privacy boundaries, staff-only authorization, audit events, tests, and documentation.
- [ ] Correct the evaluation scope from primary-only to all stages: preparatory, primary, middle, secondary, university, and independent educator contexts where applicable.
- [ ] Add the evaluation surface and encrypted local persistence to the Tauri Windows app using SQLCipher, while retaining the React web surface and server-side tenant controls.
- [ ] Confirm and document that direct local desktop implementation requires the user to bind/select the EduPulse project folder in Manus Desktop before native testing.

## All-Stage Learning Support and Venice AI Milestone

- [x] Correct evaluation scope to all EduPulse stages from preparatory through primary, middle, secondary, and higher education.
- [x] Add institution-scoped learning assessment records and staff-review support evaluation records.
- [x] Add transparent local scoring for subject trends, strengths, gaps, attendance signals, and support levels.
- [x] Add Venice server-side reasoning with bounded prompts, structured output, no-diagnosis rules, no-stigmatizing labels, and local fallback when Venice is unavailable.
- [x] Improve the public grounded AI agent by routing its evidence-based generation through Venice when configured, while preserving privacy refusal and citation validation.
- [x] Add React staff-only evaluation UI with learner selection, learning trend chart, evidence cards, contributing-factor hypotheses, recommendations, and review/share states.
- [x] Add Tauri SQLCipher commands and encrypted local evaluation storage keyed to active local sessions and institution IDs.
- [x] Add deterministic evaluation regression tests; TypeScript, full Vitest suite, and production build pass.
- [ ] Validate native Rust/Tauri compilation and Windows runtime behavior on a Windows development machine; Cargo is not installed in the current Linux sandbox.

## Confirmed All-Stage AI and Reporting Extension

- [x] Expand the evaluation scope from primary-only to all stages from preparatory through higher education.
- [x] Add staff-only React evaluation UI with trend chart, evidence, possible contributing factors, recommendations, support level, and review/share controls.
- [x] Add institution-scoped learning assessment and support-evaluation persistence on the server.
- [x] Add Venice OpenAI-compatible server adapter for grounded agent and evaluation summaries, with bounded prompts, structured output, and deterministic fallback.
- [x] Add Tauri SQLCipher save/load commands for local evaluation payloads with active-session and institution isolation.
- [x] Add date-range and product-type filters to commerce analytics and filtered browser exports.
- [x] Add administrator report-email procedure and panel control with recipient validation, CSV attachment, Resend server-side credentials, and audit logging.
- [x] Add focused evaluation and Venice adapter tests; full test suite and production build pass.
- [ ] Validate the Tauri Rust commands on Windows with Cargo and a native SQLCipher runtime; the current Linux sandbox cannot perform that verification.

## Commerce Filters and Report Delivery Extension

- [x] Add server-validated date-range and product-type filters to commerce analytics.
- [x] Apply the same filters to browser CSV/PDF exports and expose them in the admin toolbar.
- [x] Add administrator email delivery with recipient validation, CSV attachment, server-only Resend credentials, clear configuration errors, and audit logging.
- [x] Re-run TypeScript and focused analytics, evaluation, Medusa, and Venice adapter tests successfully.

## Independent Desktop Implementation Boundary

- [x] Build and complete the Tauri/SQLCipher desktop implementation in the EduPulse project without requiring access to the user’s computer.
- [x] Add or complete the web-to-native bridge for evaluation storage and local authentication using the existing desktop conventions.
- [x] Use Playwright/browser checks for web behavior and document that only native Windows compilation, WebView2 runtime behavior, and installer execution require Windows tooling.
- [x] Add a browser-safe React-to-Tauri bridge for SQLCipher-backed support-evaluation save/load operations using the active local session token.
- [x] Validate the desktop bridge type contract with TypeScript and focused evaluation/report/Venice tests.
- [x] Use browser verification for the public web shell after the independent desktop changes; landing page renders correctly at desktop size.
- [x] Document the independent implementation boundary: project code can be built here, while only native Windows compilation, WebView2, keyring, SQLCipher runtime, installer, and signing checks require Windows tooling.

## Teacher Evaluation Dashboard and Visual System Update

- [x] Build a teacher-facing visual dashboard for per-learner AI support evaluations and learning charts.
- [x] Add an explicit manual Venice evaluation action for a selected learner with loading, error, fallback, and review states.
- [x] Confirm the admin commerce dashboard exposes date-range and product-type filters plus the email export action.
- [x] Replace dark glassy toggle/select/form controls with the vivid white post-hero/dashboard design system across the application.
- [x] Replace incorrect education-level labels and options with Algeria’s preparatory, primary, middle, secondary, and higher-education stages everywhere.
- [x] Add focused tests and responsive browser validation for the new dashboard, controls, and education taxonomy.
- [x] Extend the vivid white control system to knowledge administration and school-brand settings so the correction applies beyond the main registration and commerce panels.
- [x] Re-run TypeScript, the full 60-test suite, and the production build after the global control-style extension.

## Teacher Stage Filters and University Educator Workspace

- [x] Add Algerian education-stage filtering and sorting to the teacher evaluation dashboard.
- [x] Add university educator tracking for projects, research milestones, learner achievements, intellectual-skill evidence, supervision notes, and follow-up actions.
- [x] Keep intellectual-skill indicators evidence-based and non-diagnostic; require authorized staff review.
- [x] Add tests and responsive browser validation for stage filters and university tracking.

## Teacher Stage Filters and University Educator Workspace Milestone

- [x] Add Algerian-stage filtering and name/stage sorting to the teacher evaluation learner selector.
- [x] Display the correct Arabic and English stage labels from the shared Algeria taxonomy.
- [x] Extend educator CRM records with project/research, learner achievement, intellectual-skill evidence, and university-supervision categories.
- [x] Add stage/status options and non-diagnostic guidance for the new university educator modules.
- [x] Keep the new records institution-scoped, role-gated, auditable, and compatible with existing CRM editing/archive flows.
- [x] Apply the vivid control system to the educator CRM forms and filters.
- [x] Apply and validate the schema migration; TypeScript and 14 focused CRM/taxonomy tests pass.
- [x] Run the full TypeScript suite, 60 unit tests, and production build after the stage-filter and university educator changes.
