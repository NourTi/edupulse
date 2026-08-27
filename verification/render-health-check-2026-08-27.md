# Render health check — 2026-08-27

The supplied Render logs show a Node Web Service using `pnpm run start` and the primary URL `https://edupulse-krcu.onrender.com`. The user reported deploying `1e17ba7`, but the live health URL still returns the application 404 page.

The local repository is currently on `main` at HEAD `7575414`, and `server/_core/index.ts` contains `GET /api/health/database`. The local `origin` used by WebDev is a separate internal project remote; the GitHub remote is `https://github.com/NourTi/edupulse.git`, and the current HEAD was not found by the remote-head check. Therefore the latest local checkpoint is not necessarily available in the GitHub repository that Render watches.

The Render logs also show TiDB configured at `gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/sys`, TLS enabled, with startup migration failure while creating `__drizzle_migrations`. The service became live despite that failure. No credentials were exposed. Password-recovery email delivery remains disabled.
