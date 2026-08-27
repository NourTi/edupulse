# Render health check — 2026-08-27

The user reported that Render started deploying commit `1e17ba7`. A poll during deployment still returned EduPulse’s application-level 404 page for `/api/health/database`; the deployment was not live yet at that moment. The endpoint works locally. No credentials or secrets were exposed. Password-recovery email delivery remains disabled.
