/**
 * Free public data sources for the EduPulse workspace.
 *
 * Selection principle (docs/connector-catalog.md): a source is integrated only when
 * it is genuinely free (keyless), rate-limitable, citable, and isolated from private
 * student data. Everything here is PUBLIC-DATA ONLY: never send a learner name,
 * record, grade, or phone number to these endpoints.
 *
 * Optional keys stay server-side (`process.env`); absence of a key is a normal state
 * — each source reports `configured` and the router degrades to a JSON-safe notice,
 * never a fabricated answer.
 */

export type FreeSourceHealth = { id: string; label: string; keyless: boolean; configured: boolean; note: string };

const REQUEST_TIMEOUT_MS = 9_000;
const CACHE_TTL_MS = 5 * 60_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;

const cache = new Map<string, { at: number; value: unknown }>();
const buckets = new Map<string, { windowStartedAt: number; count: number }>();

export function freeSourceRateOk(key: string, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || now - current.windowStartedAt >= RATE_WINDOW_MS) {
    buckets.set(key, { windowStartedAt: now, count: 1 });
    return true;
  }
  if (current.count >= RATE_LIMIT) return false;
  current.count += 1;
  return true;
}

async function cachedJson<T>(url: string, init?: RequestInit): Promise<T> {
  const key = `${init?.method ?? "GET"}:${url}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value as T;
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { accept: "application/json", "user-agent": "EduPulse-Workspace/1.0 (school productivity data)", ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Upstream responded with HTTP ${response.status}`);
  const value = (await response.json()) as T;
  cache.set(key, { at: Date.now(), value });
  return value;
}

// ── Open-Meteo — weather + air quality (keyless, 10k req/day, attribution required) ──
type GeocodeResponse = { results?: Array<{ name?: string; latitude?: number; longitude?: number; country?: string; admin1?: string }> };
type WeatherResponse = {
  current?: { temperature_2m?: number; relative_humidity_2m?: number; weather_code?: number; wind_speed_10m?: number };
  daily?: { time?: string[]; precipitation_sum?: number[]; temperature_2m_max?: number[]; temperature_2m_min?: number[]; weather_code?: number[] };
};
type AirResponse = { current?: { pm2_5?: number; us_aqi?: number } };

const WEATHER_CODES: Record<number, string> = {
  0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "freezing fog",
  51: "light drizzle", 61: "rain", 63: "heavy rain", 65: "very heavy rain", 71: "snow", 80: "rain showers",
  95: "thunderstorm", 96: "thunderstorm with hail",
};

export async function fetchWeather(place: string) {
  const query = place.trim().slice(0, 80);
  if (query.length < 2) throw new Error("Give a city name, e.g. Ghardaia or Laghouat.");
  const geo = await cachedJson<GeocodeResponse>(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  const spot = geo.results?.[0];
  if (!spot?.latitude || !spot.longitude) throw new Error(`No public match for “${query}”.`);
  const forecast = await cachedJson<WeatherResponse>(
    `https://api.open-meteo.com/v1/forecast?latitude=${spot.latitude}&longitude=${spot.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=3&timezone=auto`,
  );
  let aqi: number | null = null;
  let pm25: number | null = null;
  try {
    const air = await cachedJson<AirResponse>(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${spot.latitude}&longitude=${spot.longitude}&current=pm2_5,us_aqi`);
    aqi = air.current?.us_aqi ?? null;
    pm25 = air.current?.pm2_5 ?? null;
  } catch {
    // Air quality is enrichment only; weather still answers the question.
  }
  const days = (forecast.daily?.time ?? []).map((day, index) => ({
    date: day,
    code: forecast.daily?.weather_code?.[index] ?? null,
    summary: WEATHER_CODES[forecast.daily?.weather_code?.[index] ?? -1] ?? "unknown",
    maxC: forecast.daily?.temperature_2m_max?.[index] ?? null,
    minC: forecast.daily?.temperature_2m_min?.[index] ?? null,
    precipitationMm: forecast.daily?.precipitation_sum?.[index] ?? null,
  }));
  const disruption = days.find(d => (d.precipitationMm ?? 0) >= 20 || [65, 71, 95, 96].includes(d.code ?? -1));
  return {
    sourceId: "open_meteo",
    title: `Weather — ${spot.name}${spot.admin1 ? `, ${spot.admin1}` : ""}`,
    place: { name: spot.name, region: spot.admin1 ?? null, country: spot.country ?? null, latitude: spot.latitude, longitude: spot.longitude },
    now: forecast.current
      ? {
          temperatureC: forecast.current.temperature_2m ?? null,
          humidityPct: forecast.current.relative_humidity_2m ?? null,
          windKmh: forecast.current.wind_speed_10m ?? null,
          summary: WEATHER_CODES[forecast.current.weather_code ?? -1] ?? "unknown",
        }
      : null,
    days,
    aqi,
    pm25,
    schoolNote: disruption
      ? `Disruption watch on ${disruption.date}: plan remote guardian notice for transport/PE sessions (human-approved send only).`
      : days[0] && (days[0].maxC ?? 0) >= 40
        ? `Heat peak ${days[0].maxC}°C on ${days[0].date}: consider moving outdoor activities to morning blocks.`
        : "No weather-driven disruption detected for the next 3 days.",
    url: `https://open-meteo.com/en/docs`,
    citation: `Open-Meteo.com (CC-BY 4.0) — hourly/daily forecast and air quality for ${spot.name}.`,
  };
}

// ── CoinGecko — free public price board (no key; 10k/day shared pool) ──
type PriceResponse = Record<string, Record<string, number>>;
export async function fetchCryptoPrices(vs: string, ids: string[]) {
  const vsCurrency = /^[a-z]{2,5}$/i.test(vs) ? vs.toLowerCase() : "usd";
  const coinIds = ids.map(id => id.trim().toLowerCase()).filter(id => /^[a-z0-9-]{2,32}$/.test(id)).slice(0, 6);
  if (!coinIds.length) throw new Error("No valid coin id given.");
  const data = await cachedJson<PriceResponse>(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(",")}&vs_currencies=${encodeURIComponent(vsCurrency)}`);
  const prices = Object.entries(data ?? {}).map(([id, value]) => ({ id, price: Number((value as Record<string, number>)[vsCurrency] ?? 0) }));
  if (!prices.length) throw new Error("The coins were not found on the public board.");
  return {
    sourceId: "coingecko",
    title: `Markets — ${prices.map(p => p.id).join(", ")} (${vsCurrency.toUpperCase()})`,
    prices,
    url: "https://www.coingecko.com/en/api",
    citation: `CoinGecko public API — simple/price for ${coinIds.join(", ")} in ${vsCurrency.toUpperCase()}.`,
  };
}

// ── GitHub public API — open-source activity for research/seminar reading (keyless) ──
type RepoResponse = { full_name?: string; description?: string | null; stargazers_count?: number; forks_count?: number; open_issues_count?: number; pushed_at?: string; license?: { spdx_id?: string } | null; language?: string | null; html_url?: string };
export async function fetchGithubRepo(slug: string) {
  const match = slug.trim().match(/^([\w.-]+)\/([\w.-]+)$/);
  if (!match) throw new Error("Use the owner/repo form, e.g. unclecode/crawl4ai.");
  const headers: Record<string, string> = {};
  const token = (process.env.GITHUB_PUBLIC_API_TOKEN ?? "").trim();
  if (token) headers.authorization = `Bearer ${token}`; // optional raise of the 60/h unauthenticated cap
  const repo = await cachedJson<RepoResponse>(`https://api.github.com/repos/${match[1]}/${match[2]}`, token ? { headers } : undefined);
  if (!repo?.full_name) throw new Error("The repository is not publicly reachable.");
  return {
    sourceId: "github",
    title: `GitHub — ${repo.full_name}`,
    repo: {
      slug: repo.full_name,
      description: repo.description ?? null,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      openIssues: repo.open_issues_count ?? 0,
      lastPush: repo.pushed_at ?? null,
      license: repo.license?.spdx_id ?? "none",
      language: repo.language ?? null,
    },
    url: repo.html_url ?? `https://github.com/${repo.full_name}`,
    citation: `GitHub REST API (public) — repository metadata for ${repo.full_name}.`,
  };
}

// ── ERIC (U.S. Dept. of Education) — keyless education research, no auth ──
type EricResponse = { records?: Array<{ id?: string; title?: string; author?: string; publicationdateyear?: string; source?: string; linked_data?: string; description?: string }> };
export async function searchEducationResearch(query: string) {
  const q = query.trim().slice(0, 160);
  if (q.length < 3) throw new Error("Give at least three words describing the research topic.");
  const url = `https://api.ies.ed.gov/eric/?search=${encodeURIComponent(`title:${q}`)}&rows=5&format=json&fields=id,title,author,publicationdateyear,source,description,linked_data`;
  const data = await cachedJson<EricResponse>(url);
  const hits = (data.records ?? []).slice(0, 5).map(record => ({
    id: record.id ?? "",
    title: record.title ?? "Untitled record",
    author: record.author ?? "unattributed",
    year: record.publicationdateyear ?? "n.d.",
    source: record.source ?? "ERIC",
    url: record.linked_data ?? `https://eric.ed.gov/?id=${record.id ?? ""}`,
  }));
  if (!hits.length) throw new Error(`ERIC returned no records for “${q}”.`);
  return {
    sourceId: "eric",
    title: `ERIC — “${q}”`,
    hits,
    note: "Summaries for seminar/literature review only. Not curriculum content and not learner-specific; an administrator must approve before any of it becomes school knowledge.",
    url: "https://ies.ed.gov/ncep/eric-api.asp",
    citation: `U.S. Department of Education ERIC API (open, no key) — ${hits.length} records for “${q}”.`,
  };
}

// ── Open Library — keyless book/reading lists for the school library ──
type OlSearchResponse = { docs?: Array<{ title?: string; author_name?: string[]; first_publish_year?: number; cover_i?: number; key?: string; subject?: string[] }> };
export async function searchOpenLibrary(query: string) {
  const q = query.trim().slice(0, 140);
  if (q.length < 2) throw new Error("Give a book or subject to search.");
  const data = await cachedJson<OlSearchResponse>(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=5&fields=title,author_name,first_publish_year,cover_i,key,subject`);
  const books = (data.docs ?? []).map(doc => ({
    title: doc.title ?? "Untitled",
    authors: (doc.author_name ?? []).slice(0, 3),
    year: doc.first_publish_year ?? null,
    key: doc.key ?? null,
    coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    subjects: (doc.subject ?? []).slice(0, 4),
  }));
  if (!books.length) throw new Error(`Open Library has no public records for “${q}”.`);
  return {
    sourceId: "openlibrary",
    title: `Open Library — “${q}”`,
    books,
    url: "https://openlibrary.org/developers/api",
    citation: `Internet Archive Open Library search API (open) — ${books.length} titles for “${q}”.`,
  };
}

export function freeDataHealth(): FreeSourceHealth[] {
  return [
    { id: "open_meteo", label: "Open-Meteo weather + air quality", keyless: true, configured: true, note: "Keyless, 10k req/day fair use, attribution shown. Campus logistics: heat/rain disruption watch." },
    { id: "coingecko", label: "CoinGecko public price board", keyless: true, configured: true, note: "Keyless simple/price endpoint. Enrichment feed for the AI console only." },
    { id: "github", label: "GitHub public API", keyless: true, configured: Boolean((process.env.GITHUB_PUBLIC_API_TOKEN ?? "").trim()), note: "Works unauthenticated at 60 req/h/IP. Set GITHUB_PUBLIC_API_TOKEN (server secret) to raise the cap." },
    { id: "eric", label: "ERIC education research (US DoE)", keyless: true, configured: true, note: "No auth, no key. Literature-review snippets; never auto-ingested into school knowledge." },
    { id: "openlibrary", label: "Open Library catalogue", keyless: true, configured: true, note: "No auth. Reading-list and library enrichment only." },
  ];
}

export const freeDataSources = {
  open_meteo: { health: "Weather + air quality for campus logistics", run: fetchWeather },
  coingecko: { health: "Public crypto price board", run: fetchCryptoPrices },
  github: { health: "Open-source repository signals", run: fetchGithubRepo },
  eric: { health: "Education research records", run: searchEducationResearch },
  openlibrary: { health: "Book catalogue search", run: searchOpenLibrary },
} as const;
