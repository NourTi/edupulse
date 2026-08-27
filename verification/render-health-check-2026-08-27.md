# Render health check — 2026-08-27

Final live check after the user deployed the migration-diagnostic commit:

```json
{"service":"migrations","configured":true,"reachable":true,"migrationsTable":"unknown"}
```

The Render service is running the current backend and can reach the configured TiDB/MySQL database. However, the migration-table query fails in a way the driver exposes only as a bounded generic `Error`, so the endpoint correctly refuses to claim that migrations are ready. This is a migration/schema-state issue, not a database-connectivity issue. Password-recovery email delivery remains disabled.
