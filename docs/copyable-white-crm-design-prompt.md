# Copyable Prompt: EduPulse White CRM Interface

Copy everything between the lines and give it to the other AI agent together with the reference screenshot.

---

## Role

Act as a senior product designer and frontend design engineer. Redesign the EduPulse interface using the attached CRM screenshot as the visual reference. The result must feel like a modern, vivid, white education CRM—not a dark glassmorphism dashboard and not a generic admin template.

## Product context

EduPulse is an Arabic-first school-management CRM for Algeria. It serves administrators, finance staff, registrars, teachers, counsellors, students, guardians, and university educators. The interface must support Arabic RTL first and English second.

The Algerian education stages are:

- Preparatory education — التعليم التحضيري
- Primary education — التعليم الابتدائي
- Middle education — التعليم المتوسط
- Secondary education — التعليم الثانوي
- Higher education — التعليم العالي, including Licence, Master, and Doctorate

## Non-negotiable layout rule

Preserve the existing cinematic hero section exactly. Do not replace, recolour, remove, or redesign the hero.

Immediately beneath the hero, transition into a bright white CRM workspace inspired by the attached screenshot. The white CRM design must not stop at the landing page. Reuse the same design system across every authenticated dashboard:

- Administrator dashboard
- Finance dashboard
- Registrar dashboard
- Teacher dashboard
- Counsellor dashboard
- Student dashboard
- Guardian dashboard
- University educator workspace

Do not create a white landing section followed by a dark dashboard. The post-hero area and authenticated application must look like one coherent product.

## Screenshot interpretation

Use the screenshot as a reference for composition, lightness, object grouping, hierarchy, spacing, and dashboard clarity. Do not copy its brand, logo, exact text, or proprietary graphics. Translate its visual language into EduPulse’s own identity.

The post-hero section should contain a clear object-navigation workspace. Use large, attractive object cards or tiles for:

- Dashboard
- Students and learners
- Teachers and staff
- Classes and cohorts
- Subjects and curriculum
- Grades and assessments
- Attendance
- CEFR and language progress
- Support evaluations
- Projects and research
- Guardian communication
- Resource library
- Finance, invoices, and payments
- Reports and analytics

Each object must have a recognisable icon, short Arabic label, optional English label, concise supporting text, and a clear hover/focus/active state. The layout should feel organised and useful, not like a decorative icon wall.

## Visual language

Use a vivid white foundation with colourful accents. Prefer warm blue, cyan, violet, green, amber, and coral accents used selectively for meaning and navigation. Use soft grey borders, subtle shadows, layered cards, generous whitespace, and high contrast for text.

Use a soft morphism treatment only where it improves hierarchy:

- White or near-white surfaces
- Very light tinted layers behind cards
- Soft shadows rather than heavy black borders
- Medium rounded corners
- Small gradient accents
- Thin, visible focus rings
- No muddy dark panels
- No low-contrast grey text
- No excessive blur that harms readability

The interface should feel vivid, calm, trustworthy, and educational.

## Typography and Arabic quality

Arabic is the primary language. Set the document direction to RTL when Arabic is active. Use an Arabic-capable interface font with strong rendering at small and large sizes. Increase Arabic line-height and avoid letter-spacing intended for Latin text. Keep Arabic labels readable inside cards, buttons, tables, and charts.

Do not place Arabic text over busy images unless there is a strong overlay. Never allow Arabic text to become thin, compressed, clipped, or transparent. English must remain available through a language toggle without breaking the layout.

## Hero-to-dashboard transition

Keep the cinematic hero unchanged, then create a deliberate transition:

1. A white or very light bridge section.
2. A row or grid of object-navigation cards based on the screenshot.
3. Benefit callouts or hexagonal feature badges if they already exist.
4. A dashboard preview or live workspace section.
5. Clear calls to action for administrators, educators, guardians, and students.

The transition should make the visitor understand that EduPulse is a complete Student Information System and education CRM, not only a landing page.

## Hexagonal feature badges

If hexagonal badges are present, keep them as a supporting infographic layer rather than the primary navigation. Use honeycomb geometry with a light morphism treatment, readable numbers or short labels, and icons such as:

- Cost effective
- Student performance evaluation
- Attendance and progress
- Parent communication
- Local-first security
- Education CRM

The badges must remain readable in Arabic, work responsively, and not compete with the main object-navigation cards.

## Shared dashboard shell

Create one shared white CRM shell with role-aware content. The shell should include:

- A clear top bar with EduPulse identity, language control, notifications, and user menu.
- A persistent sidebar or contextual navigation that works in RTL.
- A page title, short explanation, and primary action.
- Summary KPI cards with meaningful colour accents.
- A main content area using clean cards, tables, charts, and empty states.
- A consistent search field, filters, tabs, dropdowns, toggles, pagination, and action buttons.
- Responsive behaviour for desktop, tablet, and mobile widths.

Do not duplicate the shell separately for each role. Use shared components and change the navigation, permissions, data, and actions by role.

## Role dashboard requirements

### Administrator

Show institution overview, student count, staff count, attendance snapshot, pending registrations, finance summary, announcements, team management, knowledge sources, audit activity, and shortcuts to all permitted modules.

### Finance

Show revenue, invoices, outstanding balances, discounts, refunds, payment allocations, date-range filters, product-type filters, and export controls. Keep financial data institution-scoped.

### Registrar

Show applications, registration status, documents, learner profiles, guardian links, cohorts, education stage, and class placement actions.

### Teacher

Show assigned classes, subjects, attendance, assessments, grades, learner trends, CEFR progress, support evaluations, tasks, projects, resources, and follow-up actions. Include filtering by Algerian education stage.

### Counsellor

Show behaviour and participation history, support plans, mentorship timelines, intervention follow-ups, and privacy-safe learner summaries. Avoid clinical diagnosis or stigmatizing labels.

### Student

Show the student’s own linked record only: subjects, timetable or cohorts, grades, attendance, assignments, projects, language progress, resources, and approved messages.

### Guardian

Show only explicitly linked learners: attendance, progress reports, grades where authorised, invoices, approved messages, and school-policy support questions. Never display another learner’s data.

### University educator

Add projects, research milestones, supervision notes, learner achievements, intellectual-skill evidence, academic progress, and follow-up actions. Keep indicators evidence-based and non-diagnostic.

## Data display patterns

Use the screenshot’s clear CRM grouping to make information scannable:

- KPI cards for important totals
- Progress bars for learning and attendance trends
- Compact charts with clear legends
- Tables with readable Arabic headers
- Status badges for pending, active, reviewed, archived, paid, and overdue states
- Timeline cards for mentorship, behaviour, projects, and communication
- Empty states that explain what to do next
- Loading and error states that do not break the layout

Every chart and table needs an accessible text alternative or summary. Do not use colour alone to communicate status.

## Interaction requirements

All visible controls must work or clearly identify themselves as unavailable. The search bar must be clickable and support local-record search or the configured search route. Filters must update the visible results. Buttons must show loading and error states. Role-restricted modules must be protected on the server, not only hidden in the UI.

Use short transitions under 300ms. Respect reduced-motion preferences. Add visible keyboard focus states. Keep buttons responsive on press. Do not animate layout dimensions unnecessarily.

## Privacy and security

Never expose private student records in the public assistant or an unrelated role dashboard. Enforce institution and membership checks in server procedures. Students and guardians may only see records connected to their account. Finance information must be restricted to permitted staff and the relevant guardian/student view.

The AI assistant must not invent school facts. It should answer EduPulse product questions from approved project information, treat greetings such as “thank you” as conversation, and use a safe fallback when no approved answer exists.

## Implementation constraints

Before changing code:

1. Inspect the existing component library and reuse existing dashboard, card, table, chart, form, and chat components.
2. Preserve the cinematic hero.
3. Find the current post-hero and dashboard components.
4. Replace dark glassy controls with the shared vivid-white control system.
5. Reuse the same tokens for all roles.
6. Keep all images and large assets outside the application bundle according to the project’s asset rules.
7. Add or update unit tests for role visibility, dashboard data states, Arabic labels, and responsive-safe components.
8. Run TypeScript, unit tests, production build, and visual browser checks.

## Acceptance criteria

The redesign is complete only when:

- The cinematic hero remains unchanged.
- The section beneath the hero uses the white CRM screenshot as its structural reference.
- The object-navigation cards are visible and useful.
- Every role dashboard uses the same vivid white CRM visual language.
- No dashboard falls back to the old dark, murky, anxious style.
- Arabic RTL text is readable with proper spacing and line-height.
- Algerian education stages are used consistently.
- Cards, filters, forms, tables, charts, toggles, and dropdowns share the same design system.
- Teacher, administrator, student, guardian, finance, registrar, counsellor, and university educator workflows are visibly differentiated.
- The page is responsive and keyboard accessible.
- The design is EduPulse’s own implementation, inspired by the screenshot but not copied literally.

First analyse the attached screenshot and the existing project. Then provide a short implementation plan, identify the files to change, implement the redesign, and verify the result visually and with tests. Do not redesign the hero.

---
