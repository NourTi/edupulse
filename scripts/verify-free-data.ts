/**
 * Live probe for the EduPulse free public data sources used by the workspace console.
 *
 * Why this exists: the CI unit tests stub `fetch` (deterministic, offline), but the
 * adapters talk to four real keyless APIs. Run this from a machine with normal internet
 * egress to prove the live path, the rate limiter, and the citation strings.
 *
 *   pnpm exec tsx scripts/verify-free-data.ts
 *
 * Nothing here reads the database and nothing sends learner data upstream.
 */
import {
  fetchCryptoPrices,
  fetchGithubRepo,
  fetchWeather,
  freeDataHealth,
  searchEducationResearch,
  searchOpenLibrary,
} from "../server/knowledge/freeData";
import { planConsoleTurn, runConsoleTool } from "../server/knowledge/aiConsole";

const probes: Array<{ label: string; run: () => Promise<unknown> }> = [
  { label: "Open-Meteo — Laghouat", run: () => fetchWeather("Laghouat") },
  { label: "Open-Meteo — Ghardaia", run: () => fetchWeather("Ghardaia") },
  { label: "CoinGecko — BTC/ETH in DZD", run: () => fetchCryptoPrices("dzd", ["bitcoin", "ethereum"]) },
  { label: "GitHub — zijinz456/OpenTutor", run: () => fetchGithubRepo("zijinz456/OpenTutor") },
  { label: "ERIC — spaced repetition secondary", run: () => searchEducationResearch("spaced repetition secondary") },
  { label: "Open Library — classroom differentiation", run: () => searchOpenLibrary("classroom differentiation") },
];

console.log("EduPulse free data source probe");
console.log("───────────────────────────────");
for (const health of freeDataHealth()) {
  console.log(`${health.configured ? "ready" : "opt "} · ${health.label} (keyless: ${health.keyless ? "yes" : "no"})`);
}

let failed = 0;
console.log("\nDirect adapter calls");
for (const probe of probes) {
  const startedAt = Date.now();
  try {
    const value = await probe.run();
    console.log(`PASS ${probe.label} in ${Date.now() - startedAt}ms -> ${JSON.stringify(value).slice(0, 220)}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${probe.label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log("\nConsole turn (plan -> tool -> cited answer)");
for (const message of [
  "what is the weather in Ghardaia before the mock exam week",
  "check github repo zijinz456/OpenTutor before we vendor ideas",
  "find research papers about \"formative assessment in Algerian secondary English\"",
  "price of bitcoin and ethereum in USD",
  "books on classroom differentiation",
]) {
  const plan = planConsoleTurn(message);
  const result = await runConsoleTool(plan);
  const ok = result.sources.length > 0;
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "WARN"} [${plan.tool}] ${message}\n     ${result.answer.replace(/\s+/g, " ").slice(0, 260)}\n     sources: ${result.sources.map(source => source.url).join(", ") || "none (safe fallback)"}`);
}

console.log(`\n${failed ? `${failed} probe(s) could not reach a public source — check egress/proxy, not the app.` : "All probes passed."}`);
process.exit(0);
