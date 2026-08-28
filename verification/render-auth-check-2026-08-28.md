# Render authentication diagnosis — 2026-08-28

The supplied Render logs show the deployment source is `3e44f83`. That commit predates the Descope integration, so the deployed frontend cannot display the Descope flow and the deployed backend does not contain the latest JSON-safe auth error changes.

The service starts with Google sign-in enabled and reaches the TiDB host, but `AUTO_MIGRATE=true` fails while creating the Drizzle migration table `__drizzle_migrations`. Render then reports the service live, but the migration gate blocks authentication requests. This produces the `Database setup failed` response observed by the user. The current EduPulse source with Descope and JSON-safe errors is later commit `c11fd326` on private GitHub `main`; the current deployment must use that commit or a later descendant. No secrets were recorded.

## Follow-up after agent-managed push

The private GitHub `main` branch now points to `3f7ef6ff`, a descendant of the Descope and JSON-safe commit `c11fd326`. This was pushed by the build workflow so the user did not need to create a commit. After a deployment wait, the live Descope session probe still returns HTTP 503 with `content-type: text/plain` and body `Database setup failed. Check the Render service logs.` Therefore Render has not yet switched the live service to the new revision, or its configured source/auto-deploy settings are not connected to this GitHub branch. The live database health endpoint remains HTTP 200 and reports the database reachable.
