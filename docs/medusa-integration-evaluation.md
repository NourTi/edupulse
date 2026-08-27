# Medusa-Inspired Commerce for EduPulse

## Decision

EduPulse uses the supplied Medusa repository as an **open-source architecture and feature reference**, not as a required external backend. No Medusa deployment, PostgreSQL service, publishable key, or admin token is required for the implemented milestone.

EduPulse remains a local-first school-management platform. Its own database remains the source of truth for institutions, learners, guardians, educators, enrollment, attendance, grades, identity, privacy authorization, and audit history. Commerce features are implemented inside EduPulse using Medusa-inspired concepts: products, prices, invoice lifecycle, promotions, payment allocation, refunds, and role-gated operations.

> The practical result is a usable school-commerce layer now, without forcing a school administrator to deploy or configure another system.

## Implemented capability map

| EduPulse capability | Local-first implementation | Current status |
|---|---|---|
| School fee or tutoring package catalog | Institution-scoped commerce products with Arabic and English names, amount, currency, type, and lifecycle status | Implemented |
| Registration or service invoice | Learner-linked invoice with unique institution-scoped invoice number, due date, discount, and status | Implemented |
| Payment allocation | Reviewed administrator action that records a local payment and transitions the invoice to partially paid or paid | Implemented |
| Discount control | Fixed-amount discount with server-side validation that prevents the discount exceeding the product amount | Implemented |
| Refund control | Reviewed administrator action that transitions a paid invoice to refunded and writes an audit event | Implemented as status workflow |
| Institution isolation | Every product and invoice is scoped to an institution; learner and product ownership are checked server-side | Implemented |
| Role separation | Commerce access is restricted by owner, administrator, finance administrator, registrar, and related authorized roles | Implemented |
| Auditability | Product creation, invoice creation, payment recording, status changes, and refund actions create audit events | Implemented |
| Arabic-first administration | Commerce workspace contains Arabic labels, RTL service names, learner selection, invoice issuance, payment, and refund controls | Implemented |
| External Medusa catalog | Optional bounded adapter exists and is disabled by default | Prepared, not required |
| Recurring subscriptions | Product type supports subscription plans; automated recurrence is not yet enabled | Pending scheduled-work phase |

## Why Medusa was not copied directly into EduPulse

Medusa is a headless commerce system with its own service architecture, commerce modules, workflows, and deployment assumptions. Its normal self-hosted setup introduces a separate commerce backend and PostgreSQL-oriented data boundary. Directly copying that backend into EduPulse would create competing ownership of customers, school memberships, learners, invoices, and payment state.

The safer design is therefore to reuse the **domain ideas** that are valuable to EduPulse while preserving one school-data boundary. A future optional Medusa service can be connected through the existing bounded adapter if a school later needs external payment providers, hosted checkout, advanced promotions, or recurring billing. That connection must use server-side institution mappings; the browser must never be trusted to provide institution or learner ownership.

## Current administrator workflow

An authorized administrator opens the commerce workspace and creates a fee, course, service, or subscription product. The product requires an English title, Arabic title, amount, and currency. The administrator then selects a learner and product to issue an invoice. The system calculates the invoice balance after any validated fixed discount.

The invoice list exposes the current lifecycle state. For an open invoice, the administrator can record the outstanding payment through the existing local payment ledger. For a paid invoice, a separate reviewed refund control can transition the invoice to `refunded`. Each sensitive action is role-gated, institution-scoped, and audited.

## Explicit limitations of this milestone

This implementation does not claim to be a payment gateway. The payment action records a school-confirmed local payment, such as cash or another manually verified method. It does not charge a bank card, create a hosted checkout session, reconcile gateway webhooks, or perform accounting-grade reversal entries.

Recurring subscription recurrence is also intentionally separate. It requires a persistent scheduled callback architecture, idempotency keys, renewal policy, and a clear deployment decision before automated renewals should be enabled. No in-process timer is used.

## Validation

The commerce schema migration was applied successfully. TypeScript compilation passes, the complete Vitest suite passes with 53 tests, and the production build completes successfully. The latest checkpoint is version `44b10706` and is already published to the project’s configured domain.

## References

[1]: https://medusajs.com/ "Medusa official website"
[2]: https://github.com/medusajs/medusa "Medusa GitHub repository"
[3]: https://docs.medusajs.com/learn/advanced-development/architecture/overview "Medusa architecture overview"
[4]: https://docs.medusajs.com/resources/commerce-modules "Medusa commerce modules"
[5]: https://docs.medusajs.com/learn/installation "Medusa installation documentation"
[6]: https://docs.medusajs.com/learn/introduction/build-with-llms-ai "Medusa AI and agent tooling"
