

## GitHub Pages static preview

The repository includes `.github/workflows/pages.yml`, which publishes the Vite frontend to GitHub Pages on pushes to `main`. After the first successful workflow, enable **Settings → Pages → GitHub Actions** if GitHub has not enabled it automatically. The default URL is `https://NourTi.github.io/edupulse/`; a custom domain can be configured in the Pages settings after you own and verify that domain.

GitHub Pages serves only the static frontend. EduPulse password authentication, institution memberships, MySQL records, Resend recovery, storage, and the grounded RAG procedures require the full server deployment and remain intended for Manus WebDev or another Node-capable host. The Pages build is therefore a public product/landing preview, not a substitute for the production backend.


For running the complete application outside Manus, see [`docs/portable-deployment.md`](docs/portable-deployment.md). It defines the Node 22 build/start contract, database and secret variables, Resend requirements, portable storage/LLM boundaries, and the distinction between GitHub Pages and full-stack hosting.
