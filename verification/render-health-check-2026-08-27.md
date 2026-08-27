# Render health check — 2026-08-27

Render is live on commit `7575414`. The live endpoint `https://edupulse-krcu.onrender.com/api/health/database` now returns:

```json
{"service":"database","configured":true,"reachable":true}
```

This confirms the deployed backend route is live and the configured TiDB/MySQL connection accepts `SELECT 1`. It does not by itself prove that every application migration has applied; the earlier Render logs showed an `AUTO_MIGRATE` failure while creating `__drizzle_migrations`, so migration completeness still needs confirmation from the current deployment logs or a safe schema check. No credentials were exposed. Password-recovery email delivery remains disabled.
