import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCryptoPrices, fetchWeather, freeDataHealth, freeSourceRateOk, searchEducationResearch } from "./freeData";

const jsonResponse = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });

describe("free public data adapters", () => {
  beforeEach(() => {
    // Each test owns its own fetch stub; the module cache is keyed by URL and stays small.
    freeSourceRateOk(`reset-${Math.random()}`);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("answers a weather question with a 3-day outlook and school-safe advice", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("geocoding-api")) return jsonResponse({ results: [{ name: "Ghardaia", admin1: "Ghardaia", country: "Algeria", latitude: 32.49, longitude: 3.67 }] });
      if (url.includes("air-quality")) return jsonResponse({ current: { pm2_5: 41.2, us_aqi: 112 } });
      return jsonResponse({
        current: { temperature_2m: 38.4, relative_humidity_2m: 18, weather_code: 0, wind_speed_10m: 12 },
        daily: { time: ["2026-09-06", "2026-09-07", "2026-09-08"], weather_code: [0, 61, 0], temperature_2m_max: [39, 33, 37], temperature_2m_min: [24, 22, 23], precipitation_sum: [0, 24, 0] },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchWeather("Ghardaia");
    expect(result.place.name).toBe("Ghardaia");
    expect(result.days).toHaveLength(3);
    expect(result.aqi).toBe(112);
    // 24 mm of rain and code 61 must trigger the disruption watch, not a generic sentence.
    expect(result.schoolNote).toContain("Disruption watch");
    expect(result.citation).toContain("Open-Meteo");
  });

  it("keeps the weather answer alive when the air-quality enrichment fails", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("geocoding-api")) return jsonResponse({ results: [{ name: "Laghouat", country: "Algeria", latitude: 33.8, longitude: 2.86 }] });
      if (url.includes("air-quality")) throw new Error("upstream timeout");
      return jsonResponse({ current: { temperature_2m: 30, relative_humidity_2m: 25, weather_code: 1, wind_speed_10m: 8 }, daily: { time: ["2026-09-06"], weather_code: [1], temperature_2m_max: [34], temperature_2m_min: [20], precipitation_sum: [0] } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchWeather("Laghouat");
    expect(result.aqi).toBeNull();
    expect(result.days[0].maxC).toBe(34);
  });

  it("rejects an unknown place instead of answering about some other city", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ results: [] })));
    await expect(fetchWeather("Zzzznotacity")).rejects.toThrow(/No public match/);
  });

  it("sanitises coin ids and honours the requested currency", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toContain("ids=bitcoin,ethereum");
      expect(url).toContain("vs_currencies=dzd");
      return jsonResponse({ bitcoin: { dzd: 9500000 }, ethereum: { dzd: 480000 } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchCryptoPrices("dzd", ["bitcoin", "ethereum", "<script>", "a"]);
    expect(result.prices).toHaveLength(2);
    expect(result.prices[0].price).toBe(9500000);
  });

  it("surfaces a citable ERIC record list for research questions", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ records: [{ id: "EJ1234", title: "Spaced repetition in secondary EFL", author: "D. Benali", publicationdateyear: "2024", source: "REL Journal", linked_data: "https://doi.org/10.1/x" }] })));
    const result = await searchEducationResearch("spaced repetition");
    expect(result.hits[0].title).toContain("Spaced repetition");
    expect(result.note).toMatch(/approve/i);
    expect(result.citation).toMatch(/ERIC/);
  });

  it("reports per-source configuration without secrets", () => {
    const health = freeDataHealth();
    expect(health.map(source => source.id)).toEqual(["open_meteo", "coingecko", "github", "eric", "openlibrary"]);
    for (const source of health) {
      expect(source.note.length).toBeGreaterThan(10);
      expect(JSON.stringify(source)).not.toMatch(/(token|secret|key)["']?\s*[:=]\s*\S+/i);
    }
  });

  it("rate-limits a caller beyond the free-tier window", () => {
    const key = "rate-test";
    const start = 1_000_000;
    for (let index = 0; index < 20; index += 1) expect(freeSourceRateOk(key, start + index)).toBe(true);
    expect(freeSourceRateOk(key, start + 21)).toBe(false);
    expect(freeSourceRateOk(key, start + 61_000)).toBe(true);
  });
});
