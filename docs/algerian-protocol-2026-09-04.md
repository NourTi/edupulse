# Algerian Protocol Engine — How AI Understands Your Chart + Creates Lesson Plans à l'Algérienne
**Date:** 2026-09-04 • **Status:** DESIGN (ready for Phase 1 build) • **Depends on:** `system-design-v2-creator-studio`
**You asked:** *AI can understand teacher need + understand students from chart, analyse, and create lesson plan according to Algerian system protocol — does AI need training?*
**Answer:** **No training/fine-tuning needed now. Use RAG + structured knowledge graph + official protocol prompt. Training is Phase 3 optional.**

---

## 1. What is "Algerian System Protocol" the AI Must Respect?

### Secondary (Lycée/CEM) — Competency-Based Approach (APC/CBA) since 2003

Your Ministry (MEN) does **not** want a US lesson plan. It requires:

- **Approche par les Compétences (APC):** learner-centred, *savoirs* + *savoir-faire* + *savoir-être* integrated via **Situations Problèmes** → **Situation d'Intégration**.
- **Teacher = facilitator** (not lecturer): conseiller/orientateur, learners construct knowledge.
- **Fiche de Préparation** official structure (varies slightly by wilaya inspector, but canon is):
  ```
  En-tête: Niveau / Filière / Classe / Effectif / Date / Durée / Séquence / Séance
  Compétence terminale visée (from programme officiel)
  Objectif d'apprentissage (measurable: "à la fin, l'élève sera capable de...")
  Ressources: savoirs / savoir-faire / attitudes
  Situation problème de départ (obstacle, réel, motivant)
  Déroulement CBA (4 temps):
    1. Mise en situation / Éveil (activate prior)
    2. Présentation / Observation-Découverte (confront obstacle)
    3. Fixation / Application (exercises, group work)
    4. Réinvestissement / Production + Évaluation formative
  Supports: manuel officiel (e.g., New Prospects, On the Move), tableau, fiches
  Différenciation: remédiation pour faibles / enrichissement forts
  Évaluation: formative (pendant), certificative (fin séquence)
  Devoir / Preparation
  ```
  For **English**: Framework defines *Interacting orally, Interpreting messages, Producing written messages (descriptive/narrative/argumentative/expositive, 20 lines by 3AS)*.

- **Progression Annuelle + Plan Annuel** must be followed; textbook version (e.g., *New Prospects 3AS*) is binding.

### University (LMD) — Licence 180cr (6 sem) / Master 120cr (4 sem) / Doctorat

- **UE** types: UEF (Fondamental), UEM (Méthodologie), UED (Découverte), UET (Transversale)
- **Cours (6h) / TD (9h) / TP (12h)** equivalence, **30 crédits/semestre**, semestrialisation, CC + examen + rattrapage
- **Fiche TD/TP** format: Objectif UE/CE, prérequis, déroulement TD (rappel cours → exercices → synthèse), évaluation continue
- **Supervision:** PV, attestation, contrat tutor, mémoire soutenance

**Implication:** The AI must **not invent** a generic "lesson plan". It must **select** the correct template (lycée fiche vs LMD fiche TD) and **fill it with the right competency code** from the official programme.

---

## 2. Do We Need to "Train" the AI?

| Approach | What it means | Cost / Data | Verdict for EduPulse (local-first) |
|---|---|---|---|
| **Train from scratch** | Build new LLM on Algerian data | Millions $, impossible offline | **NO** |
| **Fine-tune / LoRA** | Take Venice/Mistral/Ollama + train on ~500 Algerian fiches | Needs ~500-2000 curated fiches, GPU, risk of overfit. Good for dialect AR/Darija tone. | **Later (Phase 3, desktop optional).** Not needed to start. |
| **RAG + Structured Graph + Prompt (RECOMMENDED NOW)** | Keep Venice/Ollama frozen. Give it **your official PDFs + graph + chart** as context, and a strict system prompt that forces the Algerian fiche format. AI cites sources `[S1]` | Zero training, runs offline (graph) + online (Venice). You control quality by adding PDFs. | **YES — Phase 1.** This already gives 90% of "understands protocol". |
| **Prompt-only (no RAG)** | Just tell AI "you are Algerian teacher" | Hallucinates programme, invents competencies. Dangerous for inspector. | **NO** |

**Why RAG wins for you:** You are a facilitator with **scarce time, local data, privacy need**. RAG lets you upload your **own** Progression + manuels + 5 exemplary fiches once, and every future lesson plan is grounded in them. No telemetry, no retraining when MEN updates programme — just replace PDF.

---

## 3. Architecture — How the AI "Understands" Chart → Needs → Lesson Plan

```
[Your Studio]
  ├─ Chart Analysis Engine (already in analytics block)
  │   ├─ Cohort: N learners × attendance × CEFR/skill scores × time
  │   ├─ Output JSON: { avg: 11.2/20, weak: "past simple 48%", spread: large, atRisk: [Rania,Amal], attendance: 82% }
  │   └─ This is rule-based + FSRS/BKT, no LLM needed (fast, local)
  │
  ├─ Algerian Resource Base (NEW — your local library)
  │   ├─ Knowledge Graph: Stage/Filière/Unité→Compétence (e.g., "3AS SE — Unit Ethics → Comp: produire argumentatif")
  │   ├─ RAG Corpus: PDFs chunks → vector-lite
  │   │   • Programme Officiel (MEN 2023/24) by niveau/filière
  │   │   • Progression Annuelle (your wilaya)
  │   │   • Manuel (New Prospects, etc.) units
  │   │   • 5-10 Fiches Exemplaires (your best past fiches, anonymized)
  │   │   • Grilles d'évaluation BAC/BEM
  │   └─ Template Library: fiche_lycee_cba.json, fiche_TD_LMD.json, fiche_TP.json (bilingual AR/FR)
  │
  └─ Lesson Plan Generator (Capability: `generateLessonPlan`) — Venice / Ollama
       1. INPUT bundle: { teacherRequest, chartSummaryJson, competencyNode, ragChunks[3], template }
       2. System Prompt (Algerian protocol lock) — see §4
       3. Venice generates fiche JSON (validated via Zod) → you edit
       4. CitationManager attaches [S1] to each section (Programme p.X, Manuel U.Y)
       5. Stored in `lessonPlans` + `notebooks` (citable later)
       6. Export PDF (Cairo/Tajawal) or DOCX for inspector
```

**Example flow — Tuesday 08:00:**
- You open `2M Philosophie — English B2` → chart shows: `class avg 10.8/20, writing argumentative 42% weak, 4 learners <80% attendance`
- You click `Créer fiche → Séquence Ethics / argumentatif`
- AI reads graph: `Compétence: produire texte argumentatif 20 lignes (BO 3AS)` + RAG: `Programme p.42 + New Prospects U3` + chart gap: `past simple & connectors`
- Returns fiche CBA where *Situation problème* is tailored: *"Your city council bans social media for under 18 — argue for/against (real, local)"* + *Différenciation*: remedial fiche for the 4 at-risk (Feynman teach-back), enrichment for 3 strong (deep research).

You did not train a model. You gave it **your chart (numbers) + your protocol (template) + your programme (RAG)**.

---

## 4. System Prompt — The Protocol Lock (no training, just instruction)

```
You are an Algerian educator assistant. You MUST follow the APC/CBA protocol.
- For LYCÉE: output valid Fiche de Préparation CBA (Mise en situation → Réinvestissement + Différenciation). Cite Programme Officiel + Manuel.
- For LMD: output Fiche TD/TP (Objectif UE/CE, Prérequis, Déroulement TD, Évaluation CC).
- Language: produce AR + FR names; EN body only if cohort taughtLanguage=en.
- Always ground competency code (e.g., "Comp. Term. 3AS-SE-INT-02"). If unknown, say "Non trouvé dans base".
- Never invent a competency. Use only provided RAG chunks [S1..].
- Include évaluation formative + remédiation linked to chart gaps provided.
```

This prompt + Zod validator guarantees structure even with a frozen model.

---

## 5. What Algerian Resources We Need to Seed (you + me together)

**Phase 1 seed (minimum to be useful, 1 hour of your time):**
- [ ] 1x **Programme Officiel** PDF (your niveau/filière, e.g., 2AS/3AS English)
- [ ] 1x **Progression Annuelle** (your lycée)
- [ ] 1x **Manuel unit** (New Prospects unit you teach next)
- [ ] 3x **Fiches exemplaires** (your past fiches that passed inspection — anonymized — as few-shot)
- [ ] 1x **Grille BAC** (barème)

**Phase 2 enrichment (I scrape with your approval, stored locally):**
- Other niveaux/filières (common trunk, SE, LE, etc.)
- LMD: 1x UE description (your Master) + 1x Fiche TD exemple
- AR formal tone corpus (for gentle parent variant)

**Where to get:** MEN site (`education.gov.dz`), ONPS manuels, your own drive. **I will NOT auto-scrape without consent** — you upload, we chunk locally (sqlite-vec). Inspector-safe.

---

## 6. Roadmap — Algerian Resource Integration

**Now (Phase 1.1, after you say GO):**
- Add `lessonPlans` + `algerianResources` tables + template library
- Build Chart → JSON summarizer (rule-based, no LLM)
- Ship Lesson Plan generator block (template + Venice + citations) — no fine-tuning

**Next (Phase 2, after 10 real fiches created):**
- Evaluate: if AI still misses wilaya-specific phrasing, collect 50 fiches → fine-tune LoRA on desktop Ollama (local, optional). You own the adapter file.

**You asked "you tell me":**
> **Tell:** You do **not** need training today. Upload your 5 PDFs + 3 fiches → RAG + graph + strict prompt already makes AI produce inspector-ready fiches, tailored to your chart. Training is only if you later want your personal Darija/formal AR style baked in — and that stays on your desktop, never cloud.

---

## 7. Next Step — GO Build?

With CEFR locked (English-only) + v2 Creator Studio + this Algerian Protocol Engine, the next code is:
1. `algerianResources` + `lessonPlans` schema
2. Chart summarizer
3. Lesson Plan block (CBA fiche JSON → PDF)

Say **"GO Algerian"** and I start 1-3 as Phase 1. Or say **"GO Phase 1"** for Kanban+KB first. Your call — one step at a time.
