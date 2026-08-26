# Google OAuth 403 Investigation Notes

Google's official web-server OAuth guidance says web applications must use a Web application OAuth client and register the exact authorized redirect URI in Google Cloud. The redirect URI is the endpoint where Google sends the authorization response; its scheme, host, port, path, and trailing slash must match the request exactly. Source: https://developers.google.com/identity/protocols/oauth2/web-server

Google's official OAuth client guidance says the client ID identifies the app, the client secret is server-side confidential material, and the OAuth client type must match the application. Source: https://support.google.com/cloud/answer/15549257?hl=en

EduPulse currently starts Google sign-in at `/api/auth/google`. The server constructs the callback as `${APP_BASE_URL || request protocol/host}/api/auth/google/callback`, requests only `openid email profile`, stores a bounded HttpOnly state cookie, and exchanges the code using the same callback URL. A Google-hosted 403 page occurs before the EduPulse callback, so it points first to Google Cloud OAuth configuration or app-audience restrictions rather than the EduPulse database callback path.

Current likely checks: use the same OAuth client ID in Render and Google Cloud; make sure the client type is Web application; add the exact Render callback URL `https://edupulse-krcu.onrender.com/api/auth/google/callback` if Render is the environment being tested; add the exact current production callback URL if testing another domain; ensure the Google Auth Platform audience/testing configuration permits the Google account being used; and confirm the app is not blocked by an organization policy. Do not expose or commit the client secret.

## Live Render Check

On 27 August 2026, opening `https://edupulse-krcu.onrender.com/api/auth/google` returned Render's `Application loading` interstitial with `Service waking up` and `Allocating compute resources`, not a Google authorization page. The live service was not ready during this check, so the reported Google 403 could not be reproduced from the current Render instance. This is an additional deployment availability issue to resolve before judging the OAuth callback.

## Decisive Published-Domain Finding

Opening the published EduPulse Google sign-in endpoint reached Google's error page, which explicitly reported `Error 400: redirect_uri_mismatch` and showed the request URI as `https://x75grsbfax-u5u75l4zpq-ue.a.run.app/api/auth/google/callback`. The app name displayed as `Potato App`, confirming the Google request is using the configured Google client but the wrong backend/internal Cloud Run callback origin. EduPulse must send the public browser origin callback, such as `https://edupulse-3uaxdfe5.manus.space/api/auth/google/callback` or the Render callback when testing Render, and that exact URI must be registered in the same Google OAuth Web client.
