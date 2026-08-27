# Render health check — 2026-08-27

Render is live on the current backend. `/api/health/database` reports the database configured and reachable. The improved migration diagnostic now classifies the local state as `migrationsTable: "missing"` when the database query succeeds but `__drizzle_migrations` is absent. The live endpoint previously returned `migrationsTable: "unknown"` because the older deployed diagnostic did not extract the nested driver error code; the improved diagnostic is now pushed to GitHub and must be redeployed on Render for the same explicit classification.

No credentials were exposed. Password-recovery email delivery remains disabled.
