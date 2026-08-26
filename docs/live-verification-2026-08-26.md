# Live verification — 2026-08-26

The local EduPulse development server is reachable at the managed preview URL and the production build, TypeScript check, and full unit suite pass. The user-provided Render URL `https://edupulse-krcu.onrender.com/` was checked twice. Render returned its **Application loading** interstitial both times and reported `Service waking up`, so the deployed application did not become reachable during this verification window. Because the app UI and authenticated institution data were not served, a live grounded-answer/citation test against Render could not be completed.

The development LLM catalog is reachable through the injected server-side Forge-compatible configuration, confirming that the local model endpoint and credential are available. No model credential was exposed in this note. The remaining production verification requires the Render service to finish waking and an institution administrator account with an approved public source.
