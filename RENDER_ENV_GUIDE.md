# EduPulse Render Deployment & Environment Variables Guide

This document contains the complete list of environment variables for deploying **EduPulse** on **Render** (or any Node.js production host like Railway, Fly.io, or VPS).

---

## 1. Quick Copy-Paste for Render Environment (`.env`)

You can copy and paste the block below directly into your Render Web Service dashboard under:
**Render Dashboard → Your Web Service → Environment → Add Environment Variable / Secret File**.

```bash
# ==============================================================================
# 1. CORE SERVER & RUNTIME (RENDER ESSENTIALS)
# ==============================================================================
# Port Render routes traffic to (Render automatically sets this or uses 3000/10000)
PORT=3000
NODE_ENV=production

# Database Connection (Render PostgreSQL Database internal or external URL)
# Example: postgresql://edupulse_user:secret@dpg-xxxxxx-a.oregon-postgres.render.com/edupulse
DATABASE_URL=

# Secret key for JWT session tokens (Replace with a random 32+ character string)
JWT_SECRET=super-secret-production-jwt-key-change-me-32-chars-min

# Primary Administrator identification
OWNER_OPEN_ID=rafaraf201@gmail.com
OWNER_NAME="مؤسس EduPulse"

# Auto-apply database schema migrations on container startup
AUTO_MIGRATE=true

# ==============================================================================
# 2. AI & CORE ENGINES
# ==============================================================================
# Google Gemini API Key (Required for AI assistant, student intelligence, BAC analysis)
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=

# Optional: Venice Inference API (alternative local/uncensored model)
VENICE_INFERENCE_API_KEY=
VENICE_BASE_URL=
VENICE_MODEL=

# ==============================================================================
# 3. EXTERNAL SERVICE & ACADEMIC APIS (OPTIONAL - SAFE DEFAULTS INCLUDED)
# None of these will crash or break your app if left blank!
# ==============================================================================

# 1. NumLookupAPI (Phone verification, carrier detection, SMS OTP simulation)
# Get free key from: https://numlookupapi.com/
# (If blank, EduPulse uses the built-in active live fallback key)
NUMLOOKUP_API_KEY=

# 2. Data.gov API Key (College Scorecard secondary & higher-ed guidance)
# Get free instant key from: https://api.data.gov/signup/
# (If blank, automatically uses public "DEMO_KEY")
DATA_GOV_API_KEY=

# 3. Wolfram|Alpha LLM / Short Answers API (STEM, calculus & science computation)
# Get App ID from: https://developer.wolframalpha.com/
# (If blank, automatically uses EduPulse's built-in offline Algerian STEM calculus engine)
WOLFRAM_APP_ID=

# 4. APITemplate.io (Cloud PDF/Image generation for lesson plans & certificates)
# Get free key from: https://apitemplate.io/
# (If blank, automatically uses EduPulse's built-in browser A4 print engine)
APITEMPLATE_API_KEY=

# 5. Quoterism API Key (Curated pedagogical & philosophical quotes)
# Get key from: https://www.quoterism.com/developer
# (If blank, automatically uses EduPulse's built-in pedagogical quote library)
QUOTERISM_API_KEY=

# 6. Personality.fyi API Key (Student cognitive profiles & MBTI assessments)
# Get key from: https://personality.fyi/api/
# (If blank, automatically uses EduPulse's built-in Big Five cognitive evaluation engine)
PERSONALITY_FYI_API_KEY=

# 7. Apify Cambridge Dictionary & IPA Scraper Token (For English educators)
# Actor: https://apify.com/jungle_synthesizer/cambridge-dictionary-definition-ipa-scraper
APIFY_CAMBRIDGE_TOKEN=your_apify_token_here

# ==============================================================================
# 4. 100% FREE PUBLIC INTEGRATIONS (NO KEYS NEEDED AT ALL)
# ==============================================================================
# - Internet Archive (Archive.org): Open public search & direct book downloads
# - Open Science Framework (OSF / SHARE): Open public research preprints
# - OpenAlex / CrossRef: Open bibliographic graphs (optional polite email)
OPENALEX_API_KEY=
CROSSREF_MAILTO=rafaraf201@gmail.com

# ==============================================================================
# 5. OPTIONAL GOOGLE AUTHENTICATION
# ==============================================================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 2. Step-by-Step Instructions for Render Setup

### Step A: Create a PostgreSQL Database on Render
1. Go to your **Render Dashboard** → click **New +** → select **PostgreSQL**.
2. Name it `edupulse-db`.
3. Select the Free tier (or Starter tier).
4. Once created, copy the **Internal Database URL** (if hosting your Web Service in the same Render region) or **External Database URL**.
5. Paste it as `DATABASE_URL` in your Web Service environment.

### Step B: Create the Web Service on Render
1. Click **New +** → select **Web Service**.
2. Connect your Git repository.
3. Configure the build settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. In the **Environment** tab, click **Add Secret File** or **Add Environment Variable** and paste the variables above.
5. Make sure `GEMINI_API_KEY` is provided with your key from Google AI Studio.
6. Click **Deploy**.

---

## 3. API Fallback Behavior Summary

| Variable | Required? | Fallback Behavior if Empty on Render |
|:---|:---:|:---|
| `DATABASE_URL` | **Yes** | App will run in memory/local mock mode if missing. |
| `JWT_SECRET` | **Recommended** | Built-in fallback secret is used. |
| `GEMINI_API_KEY` | **Recommended** | AI chat & BAC analysis will request the key. |
| `NUMLOOKUP_API_KEY` | *No* | Active built-in live key is used (`num_live_...`). |
| `DATA_GOV_API_KEY` | *No* | Data.gov `DEMO_KEY` is used automatically. |
| `WOLFRAM_APP_ID` | *No* | Built-in offline Algerian calculus & STEM solver engine. |
| `APITEMPLATE_API_KEY`| *No* | High-fidelity client-side A4 Arabic print/PDF engine. |
| `QUOTERISM_API_KEY` | *No* | Curated bilingual pedagogical quotes database. |
| `PERSONALITY_FYI_API_KEY` | *No* | Built-in Big Five / MBTI pedagogical assessment engine. |
| **Archive.org** | *None* | Uses open public APIs. No key required. |
| **OSF Research** | *None* | Uses open public APIs. No key required. |
