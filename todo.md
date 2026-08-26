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
