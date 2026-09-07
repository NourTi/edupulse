/**
 * EduPulse AI console — a deliberately small, self-hosted take on the supplied
 * full-stack AI agent template (FastAPI+Next.js, CrewAI/LangGraph, Postgres).
 *
 * Adopted ideas, re-implemented in this stack (Express + tRPC + Drizzle):
 * - a tool registry with explicit input schemas and a JSON-safe error envelope;
 * - deterministic planning first, LLM polish second (Venice only when configured);
 * - a "needs_input" clarification state instead of a hallucinated guess;
 * - every answer carries citations from the public source that produced it;
 * - no framework, no vector DB, no new service to deploy on a free tier.
 *
 * The console only reads PUBLIC data (or the caller's own institution rows).
 * Private learner records are never sent to a third-party endpoint.
 */
import { fetchCryptoPrices, fetchGithubRepo, fetchWeather, searchEducationResearch, searchOpenLibrary } from "./freeData";

export type ConsoleSource = { title: string; url: string; citation: string };
export type ConsoleResult = {
  tool: string;
  answer: string;
  needsInput?: string;
  data?: unknown;
  sources: ConsoleSource[];
  polish: "local" | "venice";
};

const ALGERIA_DEFAULT = { city: "Laghouat", latitude: 33.8, longitude: 2.86 };

const clean = (value: string) => value.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);

type Plan = { tool: "weather" | "crypto" | "github" | "research" | "books" | "chat" | "needs_input"; arg: string; language: "ar" | "en"; followUp?: string };

export function planConsoleTurn(rawMessage: string): Plan {
  const message = clean(rawMessage);
  const language: "ar" | "en" = /[\u0600-\u06FF]/.test(message) ? "ar" : "en";
  const lowered = message.toLowerCase();
  const quoted = message.match(/[«"'“”]([^»"'“”]{3,140})[»"'“”]/)?.[1]?.trim();

  if (/\b(weather|forecast|temperature|rain|rainy|heat|air quality|humidity)\b/.test(lowered) || /(طقس|جو|حرارة|أمطار|تلوث|رطوبة)/.test(message)) {
    const city =
      message.match(/\b(?:in|for|à)\s+([A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF .'-]{1,60})/i)?.[1]?.trim() ??
      message.match(/(?:في|على)\s+([A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF .'-]{1,60})/)?.[1]?.trim();
    return { tool: "weather", arg: city ? city.replace(/[؟?.!]+$/g, "") : ALGERIA_DEFAULT.city, language };
  }

  if (/\b(price|prices|crypto|bitcoin|btc|ethereum|eth|market)\b/.test(lowered)) {
    const coins = Array.from(lowered.matchAll(/\b(btc|bitcoin|eth|ethereum|sol|solana|xrp|doge|ada)\b/g)).map(m => (m[1] === "bitcoin" ? "bitcoin" : m[1] === "ethereum" ? "ethereum" : m[1])).filter(Boolean);
    if (!coins.length) return { tool: "needs_input", arg: "", language, followUp: "Which coin? Try: “price of bitcoin and ethereum in USD”." };
    const vs = /\bdzd|dinar\b/i.test(lowered) ? "dzd" : "usd";
    return { tool: "crypto", arg: `${coins.slice(0, 3).join(",")}|${vs}`, language };
  }

  const repoMatch = message.match(/\b(?:github|repo|repository)\s+(?:for\s+|of\s+)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i);
  if (repoMatch) return { tool: "github", arg: repoMatch[1], language };

  if (/\b(research|paper|papers|study|studies|eric|literature|seminar|thesis)\b/.test(lowered) || /(بحث|دراسات|أبحاث|مذكرة|أطروحة)/.test(message)) {
    const topic = quoted ?? message.replace(/\b(search|find|about|on|for|eric)\b/gi, "").replace(/[؟?]/g, "").trim();
    if (topic.length < 3) return { tool: "needs_input", arg: "", language, followUp: "Give the topic in a few words, e.g. “research on spaced repetition in secondary English”." };
    return { tool: "research", arg: topic, language };
  }

  if (/\b(book|books|reading|novel|library|title)\b/.test(lowered) || /(كتاب|رواية|قراءة|مكتبة)/.test(message)) {
    const topic = quoted ?? message.replace(/\b(search|find|about|for|books?\s+on)\b/gi, "").replace(/[؟?]/g, "").trim();
    if (topic.length < 3) return { tool: "needs_input", arg: "", language, followUp: "Which subject or title? Try: “books on classroom differentiation”." };
    return { tool: "books", arg: topic, language };
  }

  if (message.length < 8) return { tool: "needs_input", arg: "", language, followUp: "Ask for weather, a public price board, a GitHub repository, education research, or library books — or use the grounded assistant for institution knowledge." };

  return { tool: "chat", arg: message, language };
}

const fmt = (value: number | null | undefined, digits = 1) => (typeof value === "number" ? value.toFixed(digits).replace(/\.0+$/, "") : "n/a");

export async function runConsoleTool(plan: Plan): Promise<ConsoleResult> {
  const noAnswer = (tool: string, reason: string): ConsoleResult => ({ tool, answer: reason, sources: [], polish: "local" });

  if (plan.tool === "needs_input") {
    return noAnswer("needs_input", plan.followUp ?? "I need a bit more detail to answer without guessing.");
  }

  try {
    if (plan.tool === "weather") {
      const weather = await fetchWeather(plan.arg || ALGERIA_DEFAULT.city);
      const days = weather.days
        .map(day => `${day.date}: ${fmt(day.minC, 0)}–${fmt(day.maxC, 0)}°C, ${day.summary}${(day.precipitationMm ?? 0) > 0 ? `, ${fmt(day.precipitationMm, 1)} mm` : ""}`)
        .join(" · ");
      const answer = [
        `${weather.title} — now ${fmt(weather.now?.temperatureC, 1)}°C, ${weather.now?.summary ?? "unknown"}, wind ${fmt(weather.now?.windKmh, 0)} km/h, humidity ${fmt(weather.now?.humidityPct, 0)}%.`,
        days,
        weather.aqi != null ? `US AQI ${fmt(weather.aqi, 0)} (PM2.5 ${fmt(weather.pm25, 1)} µg/m³).` : "Air-quality reading unavailable this minute.",
        weather.schoolNote,
      ].join(" ");
      return { tool: "weather", answer, data: weather, sources: [{ title: weather.title, url: weather.url, citation: weather.citation }], polish: "local" };
    }

    if (plan.tool === "crypto") {
      const [coinsRaw, vs] = plan.arg.split("|");
      const coins = coinsRaw.split(",").filter(Boolean);
      const board = await fetchCryptoPrices(vs || "usd", coins);
      const lines = board.prices.map(p => `${p.id}: ${p.price.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${vs.toUpperCase()}`).join(", ");
      return { tool: "crypto", answer: `${board.title} — ${lines}. Public market data, not financial advice.`, data: board, sources: [{ title: board.title, url: board.url, citation: board.citation }], polish: "local" };
    }

    if (plan.tool === "github") {
      const info = await fetchGithubRepo(plan.arg);
      const repo = info.repo;
      const answer = `${repo.slug} — ${repo.description ?? "no public description"}. ${repo.stars.toLocaleString()} stars, ${repo.forks.toLocaleString()} forks, ${repo.openIssues} open issues, last push ${repo.lastPush?.slice(0, 10) ?? "unknown"}, license ${repo.license}, primary language ${repo.language ?? "mixed"}. ${repo.license === "no assertion" || repo.license === "none" ? "No license found — treat as reference only, do not vendor code." : `License ${repo.license} — check obligations before vendoring.`}`;
      return { tool: "github", answer, data: info, sources: [{ title: info.title, url: info.url, citation: info.citation }], polish: "local" };
    }

    if (plan.tool === "research") {
      const result = await searchEducationResearch(plan.arg);
      const answer = result.hits.map(hit => `• ${hit.title} (${hit.author}, ${hit.year}, ${hit.source})`).join("\n") + `\n${result.note}`;
      return { tool: "research", answer, data: result, sources: [{ title: result.title, url: result.url, citation: result.citation }], polish: "local" };
    }

    if (plan.tool === "books") {
      const result = await searchOpenLibrary(plan.arg);
      const answer = result.books.map(book => `• ${book.title}${book.authors.length ? ` — ${book.authors.join(", ")}` : ""}${book.year ? ` (${book.year})` : ""}`).join("\n");
      return { tool: "books", answer, data: result, sources: [{ title: result.title, url: result.url, citation: result.citation }], polish: "local" };
    }

    return noAnswer("chat", "This console answers weather, markets, repository, research, and library queries. For institution knowledge and policy questions, use the grounded assistant — it answers only from approved sources with citations.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "The public source did not answer.";
    return noAnswer(plan.tool, `The public source could not answer right now (${message.slice(0, 160)}). No learner data was sent, and no answer was invented.`);
  }
}

/**
 * Optional Venice polish, mirroring the agent path in server/routers.ts:
 * the deterministic answer is authoritative; the model may only rephrase it.
 */
export function shouldPolish(message: string, result: ConsoleResult) {
  if (!result.sources.length) return false;
  if (result.tool === "needs_input" || result.answer.startsWith("The public source could not answer")) return false;
  return /\b(summar|brief|simplify|ملخص|عربي)/i.test(message);
}

export function buildPolishPrompt(message: string, result: ConsoleResult) {
  return [
    {
      role: "system" as const,
      content:
        "You are the EduPulse workspace console. Rewrite ONLY the verified facts given below into a concise Arabic or English briefing that matches the user's language. Never add new facts, numbers, or sources. If you cannot stay inside the given facts, repeat the original text verbatim.",
    },
    { role: "user" as const, content: `Request: ${message}\n\nVerified answer: ${result.answer}\n\nCited sources: ${result.sources.map(s => s.citation).join(" | ")}` },
  ];
}
