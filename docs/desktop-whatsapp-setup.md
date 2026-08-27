# EduPulse Desktop WhatsApp Setup

EduPulse uses the supplied WhatsApp MCP only in the Windows desktop application. The Render web application cannot access the local WhatsApp session or the SQLCipher database on the school computer.

## Installer behavior

The Windows workflow builds the WhatsApp MCP sidecar from upstream revision `29c82d6ccfdbc9215c62b15dd4965a6674d73be9`, packages it with EduPulse, and places its persistent browser profile under the application data directory. The installer includes the sidecar runtime and Chromium assets; end users do not clone a repository or install Python manually.

## First-run connection

Open the EduPulse desktop app and open the guardian communication module. Choose the WhatsApp connection-status action. On the first run, the local WhatsApp Web browser opens and displays a QR code. Scan it from the school’s dedicated WhatsApp account. The local profile is retained for later runs. The computer must remain on and connected when staff send messages or when a weekly task is due.

## Sending rules

A message can be sent only from the authenticated desktop app after the institution has verified the student–guardian relationship, normalized the guardian number, recorded consent, confirmed the number, and confirmed that the guardian has not opted out. Staff review the message before sending. The local SQLCipher record stores the draft and delivery result; the browser session is never sent to Render.

## Current scope

The desktop bridge currently provides WhatsApp authentication-status and one-recipient message-send commands. The weekly summary generator uses the existing attendance and CEFR assessment values and prepares a human-reviewable Arabic message. A persistent weekly scheduler, retries, idempotency records, and delivery webhook reconciliation are still required before unattended weekly sends should be enabled.

## Operational limitation

This connector automates WhatsApp Web rather than using the official WhatsApp Business Cloud API. WhatsApp Web selectors can change and the school should use a dedicated account and review WhatsApp’s terms. For a larger SaaS deployment, the same EduPulse messaging domain should later be connected to the official Business API.
