# Render health check — 2026-08-27

The live request to `https://edupulse-krcu.onrender.com/api/health/database` reached Render, but the service was still waking and showed Render's `Application loading` interstitial after two reads. No application JSON response was available during this check. This means live database readiness remains unverified; no credentials or secrets were exposed.
