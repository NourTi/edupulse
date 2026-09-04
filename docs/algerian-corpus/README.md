# Algerian Corpus — Scrape Log 2026-09-04

You said: *I don't have any docs, you can scarp them from the web.*

**Sandbox network note:** Direct PDF `curl` to `eddirasa.com` / `weebly.com` fails with `SSL_ERROR_SYSCALL` in this container (egress filter). `fetch_page` via the platform proxy **works** — so I scraped via `web_search + fetch_page` and seeded the corpus from that text. The ingestion pipeline below will continue scraping the same way in production (no curl needed).

## What was scraped today (seed)

| # | Source | What it contains | File |
|---|---|---|---|
| 1 | `education.gov.dz` + WENR + ERIC | CBA (APC) since 2003, MEN structure, streams, BAC/BEM gates | `programme-officiel-3AS.md` |
| 2 | `3as.ency-education.com` (2018 Annual Progression — 3AS) | Full table: Units 1-6, competencies, objectives, SARS activities, resources, timing (7w/21h, 8w/24h) | `progression-annuelle-3AS.md` |
| 3 | `Studocu / Plan Annuel 2020 SE2` | 2AS scientific + foreign languages: 6 themes, exit profile (descriptive/narrative/argumentative), diagnostic prereq check | `progression-annuelle-2AS.md` |
| 4 | `eddirasa + salemzemali + Academia` | New Prospects textbook: 6 Units (Ancient Civ, Ethics in Business, Education in World, Advertising/Safety, Astronomy, Feelings/Emotions) + stream mapping (which units for LETT vs SCI) + authenticity study | `new-prospects-outline.md` |
| 5 | `APC fiches modèles` (auf.org + enseignementenalgerie) | Official Fiche pédagogique structure: Phase présentation/développement/évaluation, Situation problème → intégration | `fiche-modele-cba.md` |
| 6 | `LMD guides (univ-boumerdes, UMMTO, Aleph)` | L1-L3 180cr + M1-M2 120cr, UE types (UEF/UEM/UED/UET), CC + rattrapage, TD/TP hour equivalence | `lmd-guide.md` |

All files are **distilled** from the search snippets (verbatim excerpts + structure). Next scraper run will fetch the full PDFs via the proxy and replace these stubs with full chunked text (see `scraper.ts` TODO).

## How ingestion will work (local-first, no training)

```
Scraper (fetch_page every 7 days) → docs/algerian-corpus/*.md → chunker (600 tokens, overlap 100) → vector-lite (sqlite-vec) → knowledgeGraphNodes
                                                                    ↘ Lesson Plan Generator (RAG + graph + chart) → fiche CBA/LMD JSON → PDF (Cairo/Tajawal)
```

*No fine-tuning.* RAG + graph + prompt lock already yields inspector-ready fiches (see `docs/algerian-protocol-2026-09-04.md`).

## Next scrape targets (when you say GO)

- Full `Programme Officiel 1AS, 2AS, 3AS English` from `education.gov.dz` (requires proxy fetch of PDF → `minerU`/`pdf-parse`)
- `New Prospects` full units (encrypted PDFs from `eddirasa` — need headless fetch)
- `Tawjih + Progression 2025-2026` (rumor: 2026-27 English replaces French in 3AP)
- `Bac sujets 2022-2025` (for Exam Clone block)
