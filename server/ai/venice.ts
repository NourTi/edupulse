import { ENV } from "../_core/env";

type VeniceMessage = { role: "system" | "user" | "assistant"; content: string };
type VeniceCompletion = { choices?: Array<{ message?: { content?: string }; finish_reason?: string | null }> };

const baseUrl = () => (ENV.veniceBaseUrl || "https://api.venice.ai/api/v1").replace(/\/+$/, "");

export function veniceConfigured() { return Boolean(ENV.veniceInferenceApiKey); }

export async function invokeVenice(input: { messages: VeniceMessage[]; model?: string; maxTokens?: number; jsonSchema?: Record<string, unknown> }): Promise<VeniceCompletion> {
  if (!ENV.veniceInferenceApiKey) throw new Error("Venice is not configured.");
  const payload: Record<string, unknown> = { model: input.model || ENV.veniceModel || "llama-3.3-70b", messages: input.messages, max_tokens: Math.min(input.maxTokens || 900, 1400), temperature: 0.1 };
  if (input.jsonSchema) payload.response_format = { type: "json_schema", json_schema: { name: "edupulse_support_evaluation", strict: true, schema: input.jsonSchema } };
  const response = await fetch(`${baseUrl()}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${ENV.veniceInferenceApiKey}` }, body: JSON.stringify(payload), signal: AbortSignal.timeout(12_000) });
  if (!response.ok) { const detail = (await response.text()).slice(0, 500); throw new Error(`Venice request failed with status ${response.status}: ${detail}`); }
  return await response.json() as VeniceCompletion;
}
