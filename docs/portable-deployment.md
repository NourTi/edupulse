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

`DATABASE_URL` points to the managed MySQL/TiDB-compatible database. `JWT_SECRET` is a long random value used to sign application sessions. `APP_BASE_URL` is the public HTTPS URL used in password-reset links. `RESEND_API_KEY` and `RESEND_FROM_EMAIL` enable recovery email delivery; the sender must belong to a domain verified in Resend.

The current source still contains Manus-compatible adapters for object storage and the built-in LLM gateway. A non-Manus production deployment must provide replacement adapters before enabling those routes: an S3-compatible endpoint through `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`, plus an OpenAI-compatible LLM endpoint through `LLM_API_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`. Do not copy the legacy `BUILT_IN_FORGE_*` values into an external host as a portability solution.

## GitHub Actions and host connection

GitHub Actions can build and test this repository, but it cannot run the persistent Express server. Connect the private repository to the selected Node host using its GitHub integration, or add a host-specific deployment workflow after the provider is chosen. Store all values above in the host’s secret manager, never in GitHub source or workflow YAML.

GitHub Pages remains a static preview only. It cannot execute password authentication, tRPC procedures, MySQL queries, RAG retrieval, Resend delivery, or S3 uploads.

## Domain and Resend

A provider subdomain can be used for `APP_BASE_URL` if the selected host supplies one. A custom Resend sender still requires a domain whose DNS records are controlled and verified by the account owner. OpenShip can route domains and terminate TLS when it is connected to a server, but it does not create a free domain or remove the need for a runtime host.

## RAG deployment boundary

The approved-source retrieval and citation policy belongs in the Node backend. For a portable deployment, the ingestion adapter must use a server-side crawler or approved URL extraction service, store source text/chunks in the database or S3-compatible storage, and call an OpenAI-compatible LLM only after retrieving approved institution-scoped chunks. Parent/student questions must continue to refuse unsupported personal-record claims and return citations only from approved sources.
