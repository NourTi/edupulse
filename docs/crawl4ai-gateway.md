# Crawl4AI Gateway

> **Current production path:** EduPulse imports one approved public webpage through a guarded server fetch. This is intentionally lightweight and suitable for short policy or programme pages.

> **Future heavy-document path:** Crawl4AI runs in a separate Python worker, not inside the browser or the EduPulse web process. This keeps crawling, OCR, and richer RAG dependencies isolated from the school application.

## Gateway Contract

`server/knowledge/crawl4aiGateway.ts` defines the exact hand-off.

| Direction | Record | Required safety rule |
|---|---|---|
| EduPulse → worker | `Crawl4AIJob` | A server-validated public HTTP(S) URL, source ID, visibility, and requesting administrator ID |
| Worker → EduPulse | `Crawl4AIResult` | Canonical public URL, readable text, source title, and explicit `ready` or `failed` status |
| EduPulse → assistant | Citation chunks | Only excerpts from sources whose status is `ready`; only `public` sources are used by the parent/student agent |

## When the Worker Is Enabled

An assigned administrator selects **Use advanced crawler** on an approved source. EduPulse sends a signed job payload to the separate worker. Crawl4AI obtains clean webpage content. MinerU handles PDFs, scans, and layouts. LightRAG or RAG-Anything enriches the normalized excerpts. The worker returns readable source sections—not an answer—and EduPulse continues to enforce visibility, provenance, and student-privacy rules.

## Failure Rules

If the worker fails, times out, returns an internal URL, or returns no readable text, the source remains unavailable to the public agent. The administrator sees the error and may retry or use the managed text import. No partial crawl is silently published.

## What This Is Not

This is not a deployed crawler yet. The current web app has a defined and tested gateway boundary, but a live Crawl4AI process still needs its own Python runtime and service credentials. That is the correct time to add the worker endpoint and job queue.
