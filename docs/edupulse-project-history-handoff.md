# EduPulse Project History and Continuation Handoff

**Project:** EduPulse — Arabic-first school-management CRM for Algeria  
**Repository:** `NourTi/edupulse` (private GitHub repository)  
**Primary deployment:** Render  
**Current database direction:** TiDB Cloud for the web deployment; SQLCipher/SQLite remains the planned local-first desktop foundation  
**Current stack:** React 19, TypeScript, Tailwind CSS 4, Express, tRPC 11, Drizzle ORM, MySQL/TiDB, Descope, Google OAuth, Venice AI, Resend-ready email layer, and Playwright verification.

## 1. Original direction

EduPulse began as an exploration of whether an open-source appointment/CRM project could become a useful education product. The initial references were [EasyAppointments](https://github.com/alextselegidis/easyappointments), [Compai CRM](https://github.com/trycompai/crm), Appwrite, Twenty, and a SaaS boilerplate. The conclusion was that EduPulse should not be a copy of any one repository. Those projects were references for scheduling, CRM structure, authentication, tenancy, permissions, deployment patterns, and extensibility.

The product direction became an **Arabic-first school information system and education CRM** for Algerian schools, private institutions, educational centres, university educators, teachers, students, guardians, and administrators. The purpose is to unify student, guardian, educator, course, attendance, assessment, communication, payment, and institutional information in one system.

The user explicitly required a local-first foundation so that a Windows desktop edition could work without depending entirely on the internet. At the same time, the web edition needed a shared database for institutions whose administrators, teachers, guardians, and students access the same records from different locations.

> The intended architecture is dual-mode: local encrypted storage for the desktop edition, and a shared remote database for the web edition.

## 2. Education model for Algeria

The first implementation used generic education levels. This was later corrected according to the user’s Algerian education structure. The required stages are:

| Stage | Algerian structure | Duration or characteristic |
|---|---|---|
| التعليم التحضيري | Preparatory education | Usually ages 5–6; non-compulsory |
| التعليم الابتدائي | Primary education | Five years; ends with the primary education certificate |
| التعليم المتوسط | Middle education | Four years; ends with the BEM examination |
| التعليم الثانوي | Secondary education | Three years; ends with the Baccalaureate in different streams |
| التعليم العالي | Higher education | LMD structure: Licence, Master, Doctorate |

The LMD university structure is important for the university educator edition. University features should not be treated as identical to primary or secondary school features. University teaching requires projects, research supervision, academic progress, intellectual development, publication or research tracking, student projects, seminars, and longer-term learner portfolios.

## 3. Design history and visual requirements

The user asked for an Arabic-first RTL interface, with English support, readable Arabic typography, and correct line spacing. Several visual directions were established over time.

### 3.1 Hero section

The cinematic hero section was preserved as a major visual identity element. It uses a vivid educational scene with a starry blue background, students, books, flowers, and warm lighting. The Arabic headline is large, central, and intended to communicate that every student matters. The hero includes the main navigation, language toggle, login action, short explanatory text, and calls to explore the platform or choose a role.

The hero was explicitly not to be replaced when the later dashboard redesign was requested.

### 3.2 Post-hero visual system

The user rejected a dark, anxious, pale, or old-looking interface beneath the hero. The required replacement is a **vivid white education CRM interface** with colourful accents, soft layered panels, clear cards, rounded surfaces, and strong Arabic readability.

The visual direction was influenced by the education CRM presentation on Zoho’s education page, especially the idea of placing institutional objects and metrics into a visual workspace. The design should remain EduPulse’s own design rather than copying Zoho.

The requested interface hierarchy is:

1. A preserved cinematic hero.
2. A light, vivid feature/object navigation area beneath it.
3. Visual object cards for students, teachers, grades, attendance, courses, communication, finance, library, and reports.
4. A role-specific dashboard with a persistent navigation structure.
5. Detail panels for student information, grades, evaluations, progress, payments, and communications.

### 3.3 Hexagonal feature badges

The user requested honeycomb-shaped infographic badges beneath the hero. They were intended to show benefits such as:

| Example badge | Purpose |
|---|---|
| Cost Effective | Communicate the operational value of a unified platform |
| Student Performance Evaluation | Highlight evidence-based learner support |
| Attendance and Progress | Present longitudinal monitoring |
| Parent Communication | Show guardian communication workflows |
| Local-First Security | Explain offline and encrypted data options |
| Education CRM | Position the product beyond a simple school register |

The requested style is a **morphism UI treatment**: layered hexagonal surfaces, subtle depth, soft shadows, bright gradients, iconography, and readable labels. The badges should not replace the dashboard object navigation; they are a marketing and orientation layer above the application workspace.

### 3.4 Arabic readability

A recurring issue was that Arabic text appeared compressed, poorly spaced, or visually weak. The continuation work must preserve RTL direction, use a suitable Arabic-capable font, increase line height, avoid excessive letter-spacing, and ensure that white text has sufficient contrast against image overlays. Arabic and English should not be forced into the same typographic spacing rules.

## 4. Core product modules requested

EduPulse was expanded from a prototype into a broad school-management CRM. The requested modules are:

| Module | Required scope |
|---|---|
| Institution management | Institution profile, settings, school identity, and tenant boundary |
| Users and memberships | Staff, students, guardians, invitations, role assignments, and membership tracking |
| Student information | Registration, demographic information, guardian links, stage, class, cohort, and learner lifecycle |
| Staff management | Teachers, finance staff, registrars, counsellors, and administrators |
| Admissions and registration | Arabic-first forms, student onboarding, guardian information, and document readiness |
| Classes and cohorts | Algerian education stages, cohorts, courses, subjects, and teacher relationships |
| Subjects | School subjects across primary, middle, secondary, and university contexts |
| Attendance | Attendance records, patterns, trends, and learner-linked history |
| Grades and assessments | Grades, learning assessments, CEFR assessment tracking, and longitudinal progress |
| Behaviour and participation | Behaviour history, participation, interventions, and counsellor notes |
| Teacher tasks | Structured educator tasks, follow-up actions, deadlines, and ownership |
| Essay and project pipelines | Essay review, research projects, student projects, university supervision, and status tracking |
| Resource library | Institutional resources, uploaded documents, sources, visibility, status, and staff/public distinction |
| Guardian communication | Guardian contact, progress reports, approved communication, and future automated messaging |
| Payments and commerce | Products, invoices, discounts, refunds, payment allocations, and learner-linked financial reporting |
| Reports | Progress reports, payment reports, operational exports, and PDF/CSV output |
| Analytics | Revenue, discounts, refunds, date ranges, product types, learner progress, and education metrics |
| AI support | Public visitor assistant, authenticated platform assistant, Venice evaluations, and knowledge retrieval |
| Backup and portability | Local-first data strategy, backup workflows, and eventual desktop packaging |

## 5. Roles and access model

The role model was expanded beyond a basic administrator/user split. The required roles are:

| Role | Main responsibilities |
|---|---|
| Administrator | Institution configuration, team management, permissions, all operational modules, and audit visibility |
| Finance | Products, invoices, payment allocations, discounts, refunds, revenue reporting, and finance exports |
| Registrar | Admissions, registration, student records, guardian links, documents, and class placement |
| Teacher | Classes, subjects, attendance, grades, learner progress, tasks, resources, projects, and evaluations |
| Counsellor | Behaviour, participation, interventions, wellbeing-related notes, and follow-up plans |
| Student | Personal profile, subjects, assignments, grades, progress, resources, and approved communication |
| Guardian | Linked learner view, progress reports, attendance, approved messages, invoices, and support questions |

The administrator-only team panel was implemented as a central requirement. Administrators can manage invitations and role-specific membership records. The continuation requirement is to ensure that every server procedure, not only the frontend navigation, enforces institution-scoped permissions.

The product is multi-tenant in concept: records must be scoped to the institution or workspace, and a user must never read or change another institution’s records merely by knowing an ID. This remains an important security review item for every new procedure.

## 6. Authentication history

Several authentication approaches were discussed and implemented in stages.

### 6.1 Password credentials

The user required real password-based credentials because the application is intended to be usable as a web application and Windows desktop application. Password sessions and local account flows were implemented in the server layer. Password recovery email delivery through Resend remains intentionally disabled until a verified sending domain is available.

### 6.2 Google sign-in

Google OAuth was integrated using the supplied Google client credentials through Render environment variables. Earlier failures included incorrect variable naming (`GOOGLE_ID` instead of `GOOGLE_CLIENT_ID`), OAuth state mismatches, and database errors during account creation. The Google route is separate from Descope but still depends on the database being ready because it must create or link a local EduPulse user and session.

### 6.3 Descope

Descope was added using project ID `P3IVwF6aVoQV6pz8syilausCiMYy` and a sign-up-or-in flow. The integration includes:

- React-side provider configuration.
- Sign-up/sign-in widget rendering.
- Server-side session exchange.
- Audience and identity validation.
- Local EduPulse account linking or creation.
- HttpOnly EduPulse session issuance.
- JSON-safe authentication errors.

A provider-boundary crash occurred when the Descope widget rendered without a valid provider context. The widget was then guarded so it renders only when `VITE_DESCOPE_PROJECT_ID` exists. This prevents the crash but also means the widget will not appear on Render unless the public Vite variable is present during the frontend build.

The required Render build variable is:

```text
VITE_DESCOPE_PROJECT_ID=P3IVwF6aVoQV6pz8syilausCiMYy
```

### 6.4 Legacy OAuth route

The server currently logs:

```text
[Auth] Password sessions enabled; legacy OAuth routes disabled.
```

This occurs when `OAUTH_SERVER_URL` is absent. It does not disable Google or Descope; those have separate routes. If the legacy Manus OAuth route is still required, the Render service must receive the correct `OAUTH_SERVER_URL`. The continuation decision should be explicit: either configure the legacy OAuth provider or remove the legacy route from the product documentation and rely on password, Google, and Descope.

## 7. AI agent, RAG, and retrieval history

The user repeatedly requested an AI agent that appears as a corner pop-up on the public welcome page. The duplicate embedded/background assistant was identified as a design and behaviour problem. The intended solution is one floating assistant launcher and one open chat panel, not a permanent second assistant behind it.

The assistant must understand:

- What EduPulse is.
- That EduPulse is an Arabic-first school-management CRM for Algeria.
- The project’s creator and educator-oriented purpose, as documented in approved product information.
- Algerian education stages.
- Public platform information.
- Institutional information imported by an administrator.
- Polite conversational messages such as “thank you”.
- Parent questions such as how to register a child, without incorrectly treating them as requests for private records.

The assistant must not expose private attendance, grades, fees, or learner records in public chat. It should direct authenticated guardians or approved institutional channels to private information.

The user proposed the following retrieval technologies as references or possible integrations:

| Reference | Intended use | Current status |
|---|---|---|
| Crawl4AI | Crawling and web extraction gateway | Evaluated as a suitable route, but not every external repository was integrated automatically |
| LightRAG | Lightweight retrieval graph | Requested as part of the RAG direction |
| RAG-Anything | Multimodal retrieval | Requested as an additional retrieval option |
| MinerU | PDF parsing, OCR, layout, and multimodal extraction | Requested as a document parser or fallback |
| AgentFetch MCP | Agent/web retrieval reference | Supplied for evaluation |
| Agent Scraper MCP | Scraping reference | Supplied for evaluation |
| Lobbyvoices MCP | Supplied for possible integration | Not automatically equivalent to an installed production connector |
| Brave search MCP | Supplied as a reference, with concern about paid API requirements | Must not be assumed free or enabled without credentials |

The important handoff rule is that **providing a repository or MCP link did not itself integrate the service**. A connector must be configured, authenticated, tested, and wired to a product route before it can be called an integration.

The public agent currently has a controlled knowledge route and must prefer approved EduPulse content over unrelated external search results. Earlier hallucinations—such as answering a question about EduPulse with American historical or sexual-harassment content—showed that a general fallback model must not be allowed to answer when grounding fails. The agent needs an intent classifier, approved project memory, a small-talk path, source filtering, and a clear fallback response.

## 8. Venice AI integration

Venice AI was integrated at the server layer and connected to two main workflows:

| Workflow | Purpose |
|---|---|
| Public or authenticated knowledge agent | Generate grounded answers after project knowledge and retrieval context are prepared |
| Teacher learner evaluation | Generate structured support evaluations from assessments, attendance, CEFR results, learning evidence, and educator records |

The server-side variable is:

```text
VENICE_INFERENCE_API_KEY
```

Optional configuration includes a Venice-compatible base URL and model selection. The code also includes controlled fallback behaviour when Venice is unavailable. Therefore, seeing an answer does not automatically prove Venice generated it; the server must log provider selection safely or expose a non-secret provider status for administrators.

A major deployment issue currently prevents the agent route from reaching Venice: the tRPC route is behind the database migration gate. Until the TiDB schema is ready, the public agent returns HTTP 503 before retrieval or Venice execution.

## 9. Teacher evaluations and learning intelligence

The user requested a psychological evaluation and learning chart from primary education through higher education. The intended system must not diagnose students or label them as “bad”. It should produce an evidence-based educational support summary.

The required input evidence includes:

- Assessment results by subject.
- Attendance and absence patterns.
- CEFR or language assessment history.
- Assignment completion and project progress.
- Participation and behaviour records.
- Teacher observations.
- Counsellor observations where authorized.
- Time-series changes rather than a single mark.
- Learner context and declared support needs.

The output should include:

1. Strengths.
2. Subjects or skills needing support.
3. Evidence used.
4. Possible contributing factors, expressed as hypotheses rather than diagnoses.
5. Recommended classroom or follow-up approaches.
6. Suggested review date.
7. Confidence and missing-data warnings.
8. A clear distinction between generated assistance and professional educator judgment.

The teacher dashboard was requested to show visual learner charts, filters by Algerian education stage, evaluation history, and a manual “run Venice evaluation” action for a selected student. University educators additionally need project supervision, research, intellectual development, academic achievement, and learner portfolio views.

## 10. Payments, commerce, and Medusa references

The user supplied Medusa and asked for commerce features. The requested EduPulse commerce scope includes learner-linked invoices, payment allocations, products, discounts, refunds, revenue analysis, date-range filters, product-type filters, exports, and an administrator action to simulate recurring billing for testing.

The desired reporting outputs are PDF and CSV. Emailing an export to a specified address was also requested. This must use a verified email provider and must not pretend that an email was sent when no provider is configured.

Medusa was supplied as an open-source commerce reference. It should not be described as a complete integrated Medusa backend unless its server, catalog, cart, checkout, and data flows are actually connected. EduPulse’s current commerce module is a local application module, not automatically a full Medusa deployment.

## 11. WhatsApp and external automation

The user requested a WhatsApp MCP for automated parent messaging, including weekly updates based on learner charts and results. This requires more than a connector link. It needs:

- A verified parent phone number.
- Consent and communication preferences.
- A WhatsApp provider/session that can send messages.
- A secure server-side connector.
- Message templates.
- A queue or scheduled worker.
- Audit records.
- Opt-out handling.
- Protection against sending private learner data to the wrong number.

The user also supplied MailFlat, Google Sheets, app-automation MCP listings, and the Public APIs repository as sources for future connector selection. These should be treated as a catalogue of options, not as integrations already active in EduPulse.

## 12. Local-first desktop and SQLCipher direction

The user clarified that they want an independent Windows desktop application that downloads and works like a normal application, without requiring the end user to clone a repository or install development tools.

The planned desktop architecture is:

| Layer | Responsibility |
|---|---|
| Windows installer | Package the application and runtime for ordinary users |
| Desktop UI | Reuse the React interface where practical |
| Tauri/Rust backend | Secure local commands, filesystem boundaries, and SQLCipher access |
| SQLCipher database | Encrypted local users, sessions, institution settings, learners, and operational data |
| IPC bridge | Typed commands between React and the Rust backend |
| Optional sync service | Synchronize selected data when an institution enables web access |

The user specifically requested local SQLCipher authentication tables, password hashing, secure local sessions, Tauri IPC commands, administrator registration fields, and a registration-information toggle. The requested administrator fields include name, family name, birthplace, birth date, sex, institution name, and designation, with the fields mandatory when enabled.

This desktop work is separate from the current Render/TiDB deployment. TiDB is used for the shared web edition because a Render web service cannot use a local SQLCipher file as a multi-user remote database. A future installer should package the desktop database and runtime internally; users should not need PowerShell, pnpm, or GitHub.

## 13. Deployment and repository history

The project was synchronized to a private GitHub repository `NourTi/edupulse`. The intention is that Render watches the private `main` branch and deploys automatically, so the user does not need to create a manual commit for every change.

Important revisions include:

| Revision | Meaning |
|---|---|
| `3e44f83` | Older Render deployment that predates Descope and contains the original migration behaviour |
| `c11fd326` | JSON-safe database setup error fix and later authentication corrections |
| `3f7ef6ff` | Deployment diagnosis and source-mismatch record |
| `50445ff2` | Descope provider-boundary crash fix |
| `ae02aba6` | TiDB-compatible migration preflight using `INT AUTO_INCREMENT` instead of `SERIAL` |
| `202bf100` | Bounded TiDB startup error-code/message logging |
| `e627e1b3` | Database-connection comparison evidence and verification record |

The deployed Render service has shown that it can reach TiDB at:

```text
gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/sys
```

TLS is enabled. The current decisive error is:

```text
ER_TABLEACCESS_DENIED_ERROR
```

The corrected code is active, but the Render TiDB user cannot create `__drizzle_migrations` in the `sys` database. The managed project database accessible from the development environment is a different database named `3UaxdFE52RLkhAN4mHJ6Kw`; it has full privileges but cannot repair Render’s separate TiDB database.

## 14. Current blocking issue

The current startup sequence is:

1. Render connects successfully to TiDB.
2. EduPulse attempts to create `__drizzle_migrations` using TiDB-compatible SQL.
3. TiDB rejects the operation with `ER_TABLEACCESS_DENIED_ERROR`.
4. The migration gate remains closed.
5. Google sign-in returns JSON `DATABASE_SETUP_FAILED`.
6. The public AI agent returns HTTP 503 before Venice or retrieval executes.
7. Descope can render only if its Vite project ID was present at build time; its backend exchange is also affected when local user linking needs the blocked database.

The final TiDB repair must be performed against the exact Render connection/user, not the separate managed project database. The needed action is to grant the Render-connected account table-creation rights on `sys`, or change Render’s `DATABASE_URL` to a TiDB database/user that already has those rights. The full TiDB error code now proves this is a permission issue.

## 15. OAuth issue that must remain visible

The Render log also contains:

```text
[Auth] Password sessions enabled; legacy OAuth routes disabled.
```

This is caused by the absence of `OAUTH_SERVER_URL`. It is separate from Google and Descope. The continuation developer must decide whether legacy Manus OAuth is still required. If it is required, the correct `OAUTH_SERVER_URL` must be added to Render. If it is not required, the message should be renamed or removed so operators do not confuse it with Google/Descope failure.

## 16. What is implemented versus what remains

| Area | Status |
|---|---|
| Arabic-first RTL landing page | Implemented, with continued readability refinement needed |
| Cinematic hero | Implemented and preserved |
| Vivid post-hero/dashboard direction | Implemented in the current design system, with continued polishing possible |
| Algerian education stages | Updated in the application model and teacher filtering direction |
| Multi-role model | Implemented in server and UI direction; full procedure-by-procedure audit remains important |
| Administrator team management | Implemented |
| Password sessions | Implemented |
| Google sign-in | Implemented but blocked live by TiDB migration failure |
| Descope sign-up/sign-in | Implemented; widget is guarded and requires `VITE_DESCOPE_PROJECT_ID` at Render build time |
| JSON-safe auth errors | Implemented |
| TiDB-compatible migration preflight | Implemented and deployed, but TiDB denies table creation |
| Public AI agent shell | Implemented, but live requests are blocked by the migration gate |
| Venice AI integration | Implemented in server code for agent/evaluation workflows; live provider use depends on key configuration and database readiness |
| RAG and approved project memory | Partially implemented; needs stronger grounding, intent handling, and source governance |
| Crawl4AI and external scraping | Referenced and evaluated; not every supplied MCP/repository is an active connector |
| Teacher evaluations and learning charts | Implemented in platform direction; needs live database and educator validation |
| Commerce analytics and exports | Implemented in application direction; email delivery requires verified provider configuration |
| WhatsApp automation | Requested architecture; requires a configured, authenticated connector and consent workflow |
| SQLCipher/Tauri Windows app | Planned foundation; not the same runtime as the current Render web deployment |
| Automatic Windows installer | Planned; GitHub Actions workflow remains part of the desktop continuation |
| Resend password recovery | Intentionally disabled until a verified sending domain exists |

## 17. Correct continuation order

The safest continuation order is:

1. Repair the Render TiDB user permission on the `sys` database.
2. Confirm `__drizzle_migrations` exists and all migration files apply.
3. Verify `/api/health/migrations` returns readiness.
4. Test Google sign-in, Descope session exchange, password login, and account linking.
5. Test the public AI agent with “What is EduPulse?”, Arabic small talk, and a registration question.
6. Confirm Venice provider usage and fallback behaviour.
7. Add or verify `VITE_DESCOPE_PROJECT_ID` in Render’s build environment.
8. Decide whether legacy OAuth is required and configure or remove `OAUTH_SERVER_URL` accordingly.
9. Audit tenant isolation and role permissions across every tRPC procedure.
10. Continue the Windows SQLCipher/Tauri implementation only after the shared web database path is stable.

## 18. Working principles for future development

The user’s main frustration was that supplied repositories, MCP links, and API catalogues were sometimes treated as already integrated. The correct distinction is:

> A reference is not an integration. An integration exists only when the connector is configured, the code calls it, the response is validated, errors are handled, and a test proves the workflow.

The AI agent must not hallucinate unrelated answers when an EduPulse answer is unavailable. It should identify greetings and conversational acknowledgements before retrieval, use approved EduPulse memory for product questions, cite sources when external information is permitted, and refuse private-record requests in public chat.

The system should preserve the Arabic-first identity, the Algerian education structure, institution isolation, clear role differentiation, and the local-first desktop goal. The web and desktop editions may share domain concepts and UI components, but they do not have to use the same storage runtime.

## References

[1]: https://github.com/alextselegidis/easyappointments "Easy!Appointments repository"

[2]: https://github.com/trycompai/crm "Compai CRM repository"

[3]: https://appwrite.io/ "Appwrite documentation and platform reference"

[4]: https://github.com/twentyhq/twenty "Twenty CRM repository"

[5]: https://github.com/apptension/saas-boilerplate "SaaS boilerplate reference"

[6]: https://www.zoho.com/crm/verticals/education/ "Zoho CRM for education reference"

[7]: https://github.com/unclecode/crawl4ai "Crawl4AI repository"

[8]: https://github.com/public-apis/public-apis "Public APIs catalogue"

[9]: https://github.com/medusajs/medusa "Medusa repository"

[10]: https://docs.pingcap.com/tidb/stable/mysql-compatibility/ "TiDB MySQL compatibility"

[11]: https://docs.pingcap.com/tidb/stable/sql-statement-grant-privileges/ "TiDB GRANT privileges"

[12]: https://descope.com/docs "Descope documentation"

[13]: https://docs.venice.ai/ "Venice AI documentation"

[14]: https://render.com/docs "Render documentation"
