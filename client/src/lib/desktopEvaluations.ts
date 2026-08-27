import { invoke } from "@tauri-apps/api/core";
import { isDesktopRuntime } from "./desktopRuntime";

export type LocalEvaluationPayload = {
  supportLevel: "progressing" | "needs_support" | "urgent_review";
  summary: string;
  evidence: Record<string, unknown>;
  factors: string[];
  recommendations: string[];
};

export async function saveDesktopEvaluation(input: { sessionToken: string; learnerId: string; payload: LocalEvaluationPayload; reviewStatus?: "draft" | "reviewed" | "shared" }) {
  if (!isDesktopRuntime()) throw new Error("Encrypted evaluation storage is available only in the EduPulse Windows app.");
  return invoke<string>("local_support_evaluation_save", { sessionToken: input.sessionToken, learnerId: input.learnerId, payload: JSON.stringify(input.payload), reviewStatus: input.reviewStatus ?? "draft" });
}

export async function loadDesktopEvaluations(input: { sessionToken: string; learnerId?: string }) {
  if (!isDesktopRuntime()) throw new Error("Encrypted evaluation storage is available only in the EduPulse Windows app.");
  return invoke<Array<{ id: string; learner_id: string; payload: string; created_at: number; review_status: string }>>("local_support_evaluation_load", { sessionToken: input.sessionToken, learnerId: input.learnerId ?? null });
}
