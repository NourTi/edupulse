import { invokeVenice } from "../ai/venice";
import { getPublicKnowledgeChunks } from "../db";
import { retrieveRelevantChunks } from "../knowledge/policy";

function buildCBAFichePrompt(input: {
  stage: string; stream?: string; unit: string; competencyEn: string; competencyCode: string;
  chartSummaryJson: string; durationMinutes: number; ficheKind: string;
  ragContext: string;
  weakest?: string;
}) {
  return `You are an Algerian educator assistant. You MUST follow APC/CBA protocol for Lycée.

Context:
- Stage/Stream/Unit: ${input.stage} ${input.stream ?? ""} / ${input.unit}
- Competency: ${input.competencyEn} [${input.competencyCode}]
- Fiche kind: ${input.ficheKind} — output valid CBA fiche_json with keys: enTete{ niveau,filiere,classe,effectif,duree,competenceVisee }, objectif, ressources{ savoirs,savoirFaire,savoirEtre }, situationProbleme, deroulement{ miseEnSituation, presentation, fixation, reinvestissement }, supports, differenciation{ remedial, enrichment }, evaluation{ formative, certificative }, devoir
- Duration: ${input.durationMinutes} minutes
- Chart summary (learner analytics): ${input.chartSummaryJson}
- Weakest competency detected: ${input.weakest ?? "none"}
- Retrieved Algerian programme chunks (cite as [S1]..): 
${input.ragContext}

Rules:
- Cite competency code exactly. If unknown say "Non trouvé dans base".
- Never invent a competency or theme outside provided chunks. Use only provided RAG context for citations.
- Situation problème must be real, complex, motivant (local context e.g., Algerian city council, BAC).
- Deroulement must follow 4 temps CBA.
- Differenciation MUST reference weak competency and attendance gaps from chartSummary.
- Output JSON ONLY: { fiche: {...}, citations: ["[S1] ..."] }. No prose outside JSON.
`;
}

function fallbackCBAFiche(input: { stage: string; stream?: string; unit: string; competencyEn: string; competencyCode: string; chartSummaryJson: string; durationMinutes: number }) {
  const chart = (() => { try { return JSON.parse(input.chartSummaryJson); } catch { return {} as any; } })();
  const weak = (chart as any)?.weakest ?? "general";
  return {
    fiche: {
      enTete: { niveau: input.stage, filiere: input.stream ?? "all", classe: "-", effectif: (chart as any)?.size ?? "-", duree: `${input.durationMinutes} min`, competenceVisee: `${input.competencyEn} [${input.competencyCode}]` },
      objectif: `À la fin de la séance, l'apprenant sera capable de ${input.competencyEn.toLowerCase()} en mobilisant les ressources vues, avec différenciation pour ${weak}.`,
      ressources: { savoirs: ["lexique " + input.unit, "grammar: should/had better, if/conditionals"], savoirFaire: ["interagir à l'oral", "interpréter un message écrit", "produire un texte argumentatif de 20 lignes"], savoirEtre: ["citoyenneté active", "éthique"] },
      situationProbleme: `Votre conseil municipal débat: faut-il interdire les réseaux sociaux aux moins de 18 ans ? Vous devez convaincre (contexte local algérien, réel, complexe).`,
      deroulement: {
        miseEnSituation: `Éveil: diagnostic rapide sur ${weak} (5'). Question d'accroche liée au projet du trimestre.`,
        presentation: `Observation-découverte: lecture du texte support (manuel New Prospects U2/U3) + identification de la tâche.`,
        fixation: `Application: gap-fill, reformulation conditionnelle, travail en binôme — mobilisation des ressources.`,
        reinvestissement: `Production: rédiger 12-15 lignes argumentatives (formative). Peer correction + fiche.`,
      },
      supports: ["Manuel officiel", "Tableau", "Fiche d'activité", "Corpus RAG [S1]"],
      differenciation: { remedial: `Groupe <80% attendance / score <10: fiche allégée + teach-back Feynman 5'`, enrichment: `Fort: deep research mini-exposé + connecteurs avancés` },
      evaluation: { formative: `Observation + grille formative pendant fixation`, certificative: `Situation d'intégration fin de séquence (pair work) + charte éthique` },
      devoir: `Préparer 5 connecteurs cause/effet + relire projet outcome.`,
    },
    citations: ["[S1] Programme Officiel 3AS — Ethics in Business / Ancient Civilization (MEN 2003/2018)"],
  };
}

async function getRagContext(query: string, institutionId?: string): Promise<string> {
  try {
    const chunks = await getPublicKnowledgeChunks(institutionId);
    const matches = retrieveRelevantChunks(query, chunks as any, 3);
    if (matches.length) {
      return matches.map((c: any, i: number) => `[S${i + 1}] ${c.title}: ${(c.content as string).slice(0, 600)}`).join("\n");
    }
  } catch {}
  return "No RAG context — use fallback competency only.";
}

export async function generateLessonPlanFiche(input: {
  institutionId?: string; stage: string; stream?: string; unit: string; competencyEn: string; competencyCode: string;
  chartSummaryJson: string; durationMinutes?: number; ficheKind?: "fiche_cba" | "fiche_td" | "fiche_tp";
}): Promise<{ fiche: unknown; citations: string[]; usedVenice: boolean }> {
  const ragContext = await getRagContext(`${input.stage} ${input.unit} ${input.competencyEn}`, input.institutionId);
  const weakest = (() => { try { return (JSON.parse(input.chartSummaryJson) as any)?.weakest; } catch { return undefined; } })();
  const prompt = buildCBAFichePrompt({
    stage: input.stage, stream: input.stream, unit: input.unit, competencyEn: input.competencyEn, competencyCode: input.competencyCode,
    chartSummaryJson: input.chartSummaryJson, durationMinutes: input.durationMinutes ?? 60, ficheKind: input.ficheKind ?? "fiche_cba",
    ragContext, weakest,
  });

  try {
    const venice = await invokeVenice({ messages: [{ role: "user", content: prompt }], maxTokens: 1800 } as any);
    const text = (venice as any)?.choices?.[0]?.message?.content ?? "";
    const jsonStr = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (parsed?.fiche) return { fiche: parsed.fiche, citations: parsed.citations ?? [], usedVenice: true };
    }
  } catch (e) { console.warn("[LessonPlan] Venice fallback", e); }
  const fallback = fallbackCBAFiche({
    stage: input.stage, stream: input.stream, unit: input.unit, competencyEn: input.competencyEn, competencyCode: input.competencyCode,
    chartSummaryJson: input.chartSummaryJson, durationMinutes: input.durationMinutes ?? 60,
  });
  return { fiche: fallback.fiche, citations: fallback.citations, usedVenice: false };
}

export async function generateQuizFromChunks(input: { institutionId?: string; title: string; competencyEn: string; chunkContext?: string }) {
  const rag = input.chunkContext ?? await getRagContext(input.competencyEn, input.institutionId);
  const prompt = `Generate 5 multiple-choice quiz items for Algerian ${input.title} — competency: ${input.competencyEn}. Context: ${rag}. Output JSON { items: [{q, options:[a,b,c,d], answer, explanation}] } only.`;
  try {
    const venice = await invokeVenice({ messages: [{ role: "user", content: prompt }], maxTokens: 1200 } as any);
    const text = (venice as any)?.choices?.[0]?.message?.content ?? "";
    const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    if (j?.items) return { items: j.items as unknown[], usedVenice: true };
  } catch {}
  return {
    items: [
      { q: `What is the main competency of "${input.competencyEn}"?`, options: ["Produce argumentative text", "Copy textbook", "Ignore ethics", "Translate only"], answer: "Produce argumentative text", explanation: "CBA terminal competency." },
      { q: `Which Algerian stream studies "${input.title}"?`, options: ["All streams choose 4 of 6", "Only primary", "Only university", "None"], answer: "All streams choose 4 of 6", explanation: "New Prospects stream mapping." },
      { q: `After how many weeks must Situation d'Intégration occur?`, options: ["1 week", "3/4 weeks", "10 weeks", "never"], answer: "3/4 weeks", explanation: "Progression Annuelle 3AS." },
      { q: `Cond conditional advice form:`, options: ["should/had better + if/provided that", "will + was", "must have to", "none"], answer: "should/had better + if/provided that", explanation: "Unit Ethics Grammar." },
      { q: `Ethics in Business project outcome:`, options: ["Charter of ethics", "Math formula", "Poem", "Map"], answer: "Charter of ethics", explanation: "U2 project." },
    ], usedVenice: false
  };
}

export async function evaluateTeachBack(input: { prompt: string; transcript: string }) {
  const p = `Evaluate this learner teach-back (Feynman) for Algerian competency "${input.prompt}". Transcript: "${input.transcript.slice(0, 1000)}". Score 0-100, list gaps array, feedback 2 sentences. Output JSON { score, gaps: string[], feedback }.`;
  try {
    const v = await invokeVenice({ messages: [{ role: "user", content: p }], maxTokens: 500 } as any);
    const text = (v as any)?.choices?.[0]?.message?.content ?? "";
    const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    if (j?.score != null) return j as { score: number; gaps: string[]; feedback: string };
  } catch {}
  const score = input.transcript.length > 80 ? 68 : 35;
  return { score, gaps: score < 60 ? ["missing example", "weak connectors"] : ["minor hedging"], feedback: score < 60 ? "Explique avec un exemple local et un connecteur cause/effet." : "Bien — ajoute un contre-argument pour 20 lignes." };
}
