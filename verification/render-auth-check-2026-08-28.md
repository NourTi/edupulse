# Render authentication diagnosis — 2026-08-28

The supplied Render logs show the deployment source is `3e44f83`. That commit predates the Descope integration, so the deployed frontend cannot display the Descope flow and the deployed backend does not contain the latest JSON-safe auth error changes.

The service starts with Google sign-in enabled and reaches the TiDB host, but `AUTO_MIGRATE=true` fails while creating the Drizzle migration table `__drizzle_migrations`. Render then reports the service live, but the migration gate blocks authentication requests. This produces the `Database setup failed` response observed by the user. The current EduPulse source with Descope and JSON-safe errors is later commit `c11fd326` on private GitHub `main`; the current deployment must use that commit or a later descendant. No secrets were recorded.
