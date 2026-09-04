# Descope integration notes

## Decision

EduPulse is a React 19 + Vite frontend with an Express/tRPC backend, not a Next.js application. The appropriate official integration is the React SDK (`@descope/react-sdk`) rather than `@descope/nextjs-sdk`, and the backend session boundary should use `@descope/node-sdk`.

The supplied Descope project ID is `P3IVwF6aVoQV6pz8syilausCiMYy`. The requested flow is `sign-up-or-in`.

## Security boundary

Descope’s official React + Node quickstart wraps the application in `AuthProvider`, renders the `Descope` flow component, obtains the session token from the SDK, and sends it as a Bearer token to the backend. The Node SDK validates that token and should validate the audience against the Descope project ID. EduPulse must not trust frontend user fields or role claims without backend validation.

## Rollout decision

Descope will be added as an opt-in authentication path first. Existing password and Google authentication remain available until Descope sessions are mapped to EduPulse users and institution memberships with regression coverage. No management key is required for the first authentication-validation path; a management key must not be invented or committed.

## Official references

[1]: https://docs.descope.com/getting-started/react/nodejs "Descope React & Node.js Quickstart"
[2]: https://docs.descope.com/client-sdk/descope-components "Descope Components"
[3]: https://docs.descope.com/client-sdk/initialize-sdk "Descope SDK Initialization"
[4]: https://www.npmjs.com/package/@descope/node-sdk "@descope/node-sdk package"

## Google OAuth callback clarification

For Descope Social Login using Google, the Google Cloud Console Authorized redirect URI must be the callback URI shown in Descope Console under Settings → Authentication Methods → Social Login → Google → Use my own account. Descope’s official documentation identifies the default callback pattern as `https://api.descope.com/v1/oauth/callback`; if a custom OAuth callback CNAME is configured, the URI changes to that domain’s `/v1/oauth/callback` path. The EduPulse website origin, such as `https://edupulse-krcu.onrender.com`, belongs in the allowed JavaScript origins/origin settings and is not a substitute for the Google callback URI. Sources: https://docs.descope.com/auth-methods/oauth/providers/setting-up-your-own-apps/google and https://docs.descope.com/auth-methods/oauth/settings.
