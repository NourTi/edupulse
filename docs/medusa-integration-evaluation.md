# Medusa Integration Evaluation for EduPulse

## Decision summary

Medusa is an open-source, headless commerce platform with HTTP API routes, workflows, domain modules, and a PostgreSQL data store. Its core is MIT-licensed; enterprise materials are separate. Medusa is relevant to EduPulse for commerce-shaped workflows such as course packages, enrollment deposits, school service plans, invoices, payment providers, customer records, promotions, and subscriptions. It should not replace EduPulse’s education domain, SQLCipher desktop database, institution memberships, learner records, or grounded knowledge system.

## Official findings

Medusa’s documented architecture separates API routes, workflows, modules, and data storage. Common deployments use PostgreSQL and may use Redis for sessions, caching, events, locking, and workflow execution. Medusa’s commerce modules include customer, order, payment, pricing, product, promotion, region, sales channel, subscription-related extensions, store credit, tax, and user capabilities.

The correct EduPulse architecture is a separate commerce service or bounded commerce module. EduPulse remains the source of truth for institutions, students, guardians, educators, enrollment status, attendance, grades, and privacy authorization. Medusa owns purchasable service definitions, checkout/order state, payment-provider interactions, invoices or receipts derived from payment state, and optional subscription state. The two systems communicate through explicit institution-scoped IDs and server-side service calls; the browser must not be trusted to connect records.

## Proposed EduPulse mappings

| EduPulse need | Medusa capability | Ownership boundary |
|---|---|---|
| Course or tutoring package catalog | Product and pricing modules | Medusa owns purchasable package definitions; EduPulse owns academic assignment and learner eligibility |
| Registration deposit or service fee | Cart, order, and payment modules | Medusa owns payment state; EduPulse records the linked institution and learner context |
| Parent/guardian payer profile | Customer module | Medusa receives only the minimum payer data required for payment; EduPulse retains the guardian relationship |
| Discounts or institutional offers | Promotion and pricing modules | Medusa owns calculation; EduPulse controls who is eligible |
| School-specific commerce channel | Sales channel and store modules | Every record is tagged with an EduPulse institution identifier and checked server-side |
| Refund or payment dispute | Payment and order workflows | Medusa reports the event; EduPulse updates its local financial view and audit log |
| Recurring service plan | Custom subscription workflow or compatible commerce module | EduPulse controls academic service entitlement; Medusa controls billing state |

## Constraints

Medusa’s common self-hosted installation requires Node.js and PostgreSQL, and the backend/admin application is separate from the existing EduPulse MySQL/TiDB web stack and SQLCipher Windows desktop mode. Therefore, copying Medusa files directly into EduPulse would create two competing backend/data models and would not be a safe full-stack integration.

The recommended implementation is to add a thin EduPulse commerce adapter and an optional Medusa service. The adapter owns institution authorization, maps EduPulse entities to Medusa IDs, prevents cross-institution access, and writes audit events. If Medusa is not configured, EduPulse retains its current local payment-record workflow instead of failing.

## References

- [1] [Medusa official website](https://medusajs.com/)
- [2] [Medusa GitHub repository](https://github.com/medusajs/medusa)
- [3] [Medusa architecture overview](https://docs.medusajs.com/learn/advanced-development/architecture/overview)
- [4] [Medusa commerce modules](https://docs.medusajs.com/resources/commerce-modules)
- [5] [Medusa installation documentation](https://docs.medusajs.com/learn/installation)
- [6] [Medusa AI and agent tooling](https://docs.medusajs.com/learn/introduction/build-with-llms-ai)
