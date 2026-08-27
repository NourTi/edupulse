import { ENV } from "../_core/env";

export type MedusaStatus = {
  configured: boolean;
  backendUrl: string | null;
  hasPublishableKey: boolean;
  hasAdminToken: boolean;
};

export type MedusaProduct = {
  id: string;
  title: string;
  description: string | null;
  handle: string | null;
  status: string | null;
  thumbnail: string | null;
  variants: Array<{ id: string; title: string; sku: string | null; prices: Array<{ amount: number; currency_code: string }> }>;
};

const timeoutMs = 8_000;

function configured() {
  return Boolean(ENV.medusaBackendUrl && ENV.medusaPublishableKey);
}

export function getMedusaStatus(): MedusaStatus {
  return {
    configured: configured(),
    backendUrl: ENV.medusaBackendUrl || null,
    hasPublishableKey: Boolean(ENV.medusaPublishableKey),
    hasAdminToken: Boolean(ENV.medusaAdminToken),
  };
}

function asProduct(value: unknown): MedusaProduct | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.title !== "string") return null;
  const variants = Array.isArray(item.variants) ? item.variants : [];
  return {
    id: item.id,
    title: item.title,
    description: typeof item.description === "string" ? item.description : null,
    handle: typeof item.handle === "string" ? item.handle : null,
    status: typeof item.status === "string" ? item.status : null,
    thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : null,
    variants: variants.flatMap((variant) => {
      if (!variant || typeof variant !== "object") return [];
      const row = variant as Record<string, unknown>;
      if (typeof row.id !== "string" || typeof row.title !== "string") return [];
      const prices = Array.isArray(row.prices) ? row.prices.flatMap((price) => {
        if (!price || typeof price !== "object") return [];
        const p = price as Record<string, unknown>;
        return typeof p.amount === "number" && typeof p.currency_code === "string" ? [{ amount: p.amount, currency_code: p.currency_code }] : [];
      }) : [];
      return [{ id: row.id, title: row.title, sku: typeof row.sku === "string" ? row.sku : null, prices }];
    }),
  };
}

export async function listMedusaProducts(): Promise<MedusaProduct[]> {
  if (!configured()) return [];
  const response = await fetch(`${ENV.medusaBackendUrl}/store/products?limit=100`, {
    method: "GET",
    headers: { Accept: "application/json", "x-publishable-api-key": ENV.medusaPublishableKey },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`Medusa catalog request failed with HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") return [];
  const products = (payload as Record<string, unknown>).products;
  return Array.isArray(products) ? products.flatMap((item) => { const product = asProduct(item); return product ? [product] : []; }) : [];
}

export async function medusaAdminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!ENV.medusaBackendUrl || !ENV.medusaAdminToken) throw new Error("Medusa admin integration is not configured.");
  const response = await fetch(`${ENV.medusaBackendUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${ENV.medusaAdminToken}`, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`Medusa admin request failed with HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}
