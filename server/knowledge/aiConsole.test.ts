import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPolishPrompt, planConsoleTurn, runConsoleTool, shouldPolish } from "./aiConsole";

describe("AI console planner (agent-template patterns, deterministic first)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("routes a weather request and extracts the city", () => {
    const plan = planConsoleTurn("What is the weather in Ghardaia this week?");
    expect(plan.tool).toBe("weather");
    expect(plan.arg).toBe("Ghardaia this week");
    expect(plan.language).toBe("en");
  });

  it("answers an Arabic logistics question in Arabic", () => {
    const plan = planConsoleTurn("ما هي الحرارة في غرداية");
    expect(plan.tool).toBe("weather");
    expect(plan.language).toBe("ar");
  });

  it("asks for the missing detail instead of guessing", () => {
    const crypto = planConsoleTurn("what is the crypto price today");
    expect(crypto.tool).toBe("needs_input");
    expect(crypto.followUp).toMatch(/Which coin/);
    const research = planConsoleTurn("search for research");
    expect(research.tool).toBe("research"); // default ERIC literature query, not a guess about a learner
    expect(research.arg).toBe("research");
    expect(planConsoleTurn("find research papers on").tool).toBe("research"); // default broad literature query
    expect(planConsoleTurn("res").tool).toBe("needs_input"); // too thin to query a public source
  });

  it("parses markets, repositories, research, and library intents", () => {
    expect(planConsoleTurn("price of bitcoin and ethereum in DZD").arg).toBe("bitcoin,ethereum|dzd");
    expect(planConsoleTurn("check github repo unclecode/crawl4ai").arg).toBe("unclecode/crawl4ai");
    expect(planConsoleTurn('find research papers on "differentiated instruction"').arg).toBe("differentiated instruction");
    expect(planConsoleTurn("books on classroom differentiation").tool).toBe("books");
  });

  it("leaves institution knowledge to the grounded assistant", async () => {
    const plan = planConsoleTurn("tell me more about the platform and its features");
    expect(plan.tool).toBe("chat");
    const result = await runConsoleTool(plan);
    expect(result.answer).toMatch(/grounded assistant/);
  });

  it("never invents an answer when a public source fails, and leaks no learner data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 503 })));
    const result = await runConsoleTool({ tool: "weather", arg: "Rania Cherif +213 555 014 102", language: "en" });
    expect(result.answer).toMatch(/could not answer right now/);
    expect(result.answer).toMatch(/No learner data was sent/);
    expect(result.sources).toEqual([]);
    const leaked = JSON.stringify(result);
    expect(leaked).not.toContain("+213 555 014 102");
    expect(leaked).not.toMatch(/DATABASE_URL|passwordHash/i);
  });

  it("builds a citation-carrying, local-first answer for a successful tool run", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      const json = (payload: unknown) => new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } });
      if (url.includes("geocoding-api")) return json({ results: [{ name: "Laghouat", country: "Algeria", latitude: 33.8, longitude: 2.86 }] });
      if (url.includes("air-quality")) return json({ current: { us_aqi: 55, pm2_5: 12 } });
      return json({ current: { temperature_2m: 31.5, relative_humidity_2m: 20, weather_code: 0, wind_speed_10m: 9 }, daily: { time: ["2026-09-06"], weather_code: [0], temperature_2m_max: [36], temperature_2m_min: [21], precipitation_sum: [0] } });
    }));
    const result = await runConsoleTool({ tool: "weather", arg: "Laghouat", language: "en" });
    expect(result.polish).toBe("local");
    expect(result.sources[0].citation).toContain("Open-Meteo");
    expect(result.answer).toContain("31.5°C");
  });

  it("only offers model polish for an explicit summarising request", () => {
    const withSources = { tool: "weather", answer: "36°C on Sunday.", sources: [{ title: "Open-Meteo", url: "https://open-meteo.com", citation: "Open-Meteo.com (CC-BY 4.0)" }], polish: "local" as const } as const;
    expect(shouldPolish("summarise this for the staff group", withSources)).toBe(true);
    expect(shouldPolish("what is the weather", withSources)).toBe(false);
    expect(shouldPolish("summarise this", { ...withSources, sources: [] })).toBe(false);
    const prompt = buildPolishPrompt("summarise this", withSources);
    expect(JSON.stringify(prompt)).toContain("Open-Meteo.com");
    expect(JSON.stringify(prompt)).toMatch(/Never add new facts/);
  });
});

