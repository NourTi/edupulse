# Portable EduPulse deployment

EduPulse can be built from the private GitHub repository and run on any Node-capable host that supports Node 22, pnpm 10, outbound HTTPS, and a persistent MySQL-compatible database. The repository is the source of truth; the runtime host is responsible for the running server, database connection, and secret injection.

## Build and start

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm run build
NODE_ENV=production corepack pnpm start
```

The host must pass its assigned port through `PORT`; the server must not be configured with a fixed production port. Run `corepack pnpm db:push` only after reviewing generated migrations against a backup of the production database.

## Required runtime variables

`DATABASE_URL` points to the managed MySQL/TiDB-compatible database. For TiDB Cloud Starter, copy the full MySQL URL from **Connect → General**, including the TiDB username prefix and database name. EduPulse automatically enables TLS for TiDB Cloud hosts and for URLs containing `sslaccept=strict`; do not remove the TLS requirement. On Render Free, set `AUTO_MIGRATE=true` for the first deployment after creating a new database; the service applies pending repository migrations during startup and then serves requests. After a successful migration, you may remove the flag or leave it enabled because already-applied migrations are skipped. `JWT_SECRET` is a long random value used to sign application sessions. `APP_BASE_URL` is the public HTTPS URL used in password-reset links. `RESEND_API_KEY` and `RESEND_FROM_EMAIL` enable recovery email delivery; the sender must belong to a domain verified in Resend. `OAUTH_SERVER_URL` is not required: EduPulse uses password sessions by default and loads the legacy OAuth routes only when that variable is deliberately configured.

Portable adapter paths are now available for object storage and the LLM gateway. Configure an S3-compatible endpoint through `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`; the storage adapter uses signed URLs for private objects. Configure an OpenAI-compatible LLM endpoint through `LLM_API_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`. If these portable variables are absent, the legacy Manus adapters remain available for compatibility; do not copy legacy `BUILT_IN_FORGE_*` values into an external host unless you intentionally want that dependency.

## GitHub Actions and host connection

GitHub Actions and CircleCI can build and test this repository, but they do not run the persistent Express server. Connect the private repository to the selected Node host using its GitHub integration, or use the guarded CircleCI webhook after configuring the production context. Store all values above in the host’s secret manager, never in GitHub source or workflow YAML.

GitHub Pages remains a static preview only. It cannot execute password authentication, tRPC procedures, MySQL queries, RAG retrieval, Resend delivery, or S3 uploads.

## Domain and Resend

A provider subdomain can be used for `APP_BASE_URL` if the selected host supplies one. A custom Resend sender still requires a domain whose DNS records are controlled and verified by the account owner. OpenShip can route domains and terminate TLS when it is connected to a server, but it does not create a free domain or remove the need for a runtime host.

## RAG deployment boundary

The approved-source retrieval and citation policy belongs in the Node backend. For a portable deployment, the ingestion adapter must use a server-side crawler or approved URL extraction service, store source text/chunks in the database or S3-compatible storage, and call an OpenAI-compatible LLM only after retrieving approved institution-scoped chunks. Parent/student questions must continue to refuse unsupported personal-record claims and return citations only from approved sources.


## CircleCI deployment

The repository also includes `.circleci/config.yml`. CircleCI runs type checking, unit tests, and the production build on every change. On `main`, deployment pauses for an explicit approval step and then calls a configured external-host webhook. Create a CircleCI context named `edupulse-production` containing `DEPLOY_WEBHOOK_URL` and `DEPLOY_WEBHOOK_TOKEN`; without both values the deploy job refuses to run. This pipeline does not deploy to GitHub Pages or Manus and does not contain credentials.


### Resend sender requirement

Resend's official guidance states that the `resend.dev` domain is for testing only and can send only to the email address associated with the Resend account. Sending password-recovery messages to other users requires adding and verifying a domain in Resend, then using a sender address on that verified domain. Source: https://resend.com/docs/knowledge-base/403-error-resend-dev-domain


### Optional Google sign-in

Google sign-in is optional and does not replace password login. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` only in the Render secret manager. In Google Cloud Console, add this exact authorized redirect URI:

```text
https://edupulse-krcu.onrender.com/api/auth/google/callback
```

The application checks the OAuth state cookie, requests a verified Google email, links the Google identity to an existing EduPulse email when available, and creates no institution membership automatically. An administrator must invite or assign the user to an institution before school records become available.

If Google returns `Invalid Google sign-in state`, start a new login from the EduPulse login page rather than refreshing an old callback URL. The callback state is intentionally one-time; the server supports up to five open login tabs and removes only the state that was used.

If Google returns `Google sign-in is temporarily unavailable`, check the Render service logs using the reference shown on the error page. If the message says the authentication migration is missing, apply the repository migrations to the same database referenced by Render’s `DATABASE_URL`, then redeploy. The required Google identity table is created by migration `0005_dark_living_tribunal.sql`.

For a safe connection check in a Render Shell, run `node scripts/check-db.mjs` from the repository root. It performs only `SELECT 1`, prints the host and database name, and never prints the username or password. Run this check before applying migrations. A successful check proves that Render can reach TiDB; it does not apply schema changes. Render Free does not provide Shell access, so use `AUTO_MIGRATE=true` instead.
