# Render health check — 2026-08-27

The first request reached Render while the service was waking. A retry after wake-up returned EduPulse's application-level 404 page for `/api/health/database`, not the expected JSON. This indicates the Render deployment is not running the checkpoint that contains the new endpoint, or its route was not redeployed. No credentials or secrets were exposed. Local verification remains successful.
