# WhatsApp MCP Evaluation for EduPulse

Source: https://glama.ai/mcp/servers/ekaksher/whatsapp-mcp

## Verified transport

The supplied WhatsApp MCP is a local Python MCP server. It automates WhatsApp Web through Playwright and Chromium and exposes tools over stdio. It persists a WhatsApp Web browser profile under a local `./data/profile` directory. Its listed tools include `get_auth_status`, `wait_until_ready`, `list_recent_chats`, `get_recent_messages`, `send_message`, and `shutdown_browser`.

The project page explicitly states that it automates WhatsApp Web, not the official WhatsApp Business API. Its message operations can target either a phone number or an existing chat name. WhatsApp Web selectors can change over time, so maintenance is required.

## EduPulse fit and boundary

This connector can support a controlled department-to-guardian send flow only when it runs in a trusted, persistent environment where an authorized school WhatsApp account has been logged in through QR/session setup. It cannot run reliably inside the current stateless Render web process because the browser session and Chromium process must persist. It should not be placed in the browser, exposed as a public endpoint, or given student data beyond the minimum approved message and destination.

The connector is not an official WhatsApp Business API integration. That means the school must understand the operational and account-risk tradeoff before production use. The official API route is more suitable for a long-term SaaS, but it requires Meta Business verification, a WhatsApp Business sender, templates, webhooks, and provider configuration.

## Recommended architecture

For a first controlled pilot, keep EduPulse on Render and run the WhatsApp MCP as a separate private, always-on worker. EduPulse sends a signed, minimal job to that worker after institution-scoped guardian lookup, consent validation, role authorization, preview/approval, and audit creation. The worker owns the WhatsApp Web session and returns only delivery status and a provider message identifier. Weekly progress summaries should be generated and scheduled by EduPulse, then submitted to the worker as approved messages.

For production scale, replace the WhatsApp Web worker with the official WhatsApp Business Cloud API. Keep the same EduPulse messaging domain model and scheduled handler so the provider can be swapped without changing guardian lookup, consent, templates, auditing, or data isolation.

## Non-negotiable safeguards

Never send grades, attendance, fees, or student identity to an unverified phone number. Use an explicit institution-scoped guardian relationship, normalized phone number, consent flag, opt-out state, role check, preview/approval state, idempotency key, rate limit, delivery audit, and retry policy. Weekly jobs must use the site’s scheduled callback architecture, not an in-process timer. The message must contain the minimum necessary progress summary and must not expose another learner’s data.
