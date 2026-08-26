export type AgentIntent = "conversation" | "platform" | "enrollment" | "protected_record" | "approved_source" | "general_knowledge" | "unknown";
export type AgentOutcome = "answered" | "redirected" | "no_source" | "provider_error" | "rate_limited";

export function recordAgentEvent(event: { intent: AgentIntent; outcome: AgentOutcome; sourceCount: number; durationMs: number }) {
  console.info("[Agent]", JSON.stringify({
    intent: event.intent,
    outcome: event.outcome,
    sourceCount: event.sourceCount,
    durationMs: Math.max(0, Math.round(event.durationMs)),
  }));
}
