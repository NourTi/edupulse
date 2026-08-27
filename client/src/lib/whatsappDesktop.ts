import { invoke } from "@tauri-apps/api/core";
import { isDesktopRuntime } from "./desktopRuntime";

export type WhatsAppAuthStatus = Record<string, unknown>;

export function normalizeWhatsAppPhone(phoneNumber: string) {
  const normalized = phoneNumber.trim().replace(/[ ()-]/g, "");
  if (normalized.length < 8 || normalized.length > 20 || !/^[+0-9]+$/.test(normalized)) {
    throw new Error("The guardian phone number is not valid.");
  }
  return normalized;
}

function requireDesktop() {
  if (!isDesktopRuntime()) {
    throw new Error("WhatsApp messaging is available only in the EduPulse Windows desktop app.");
  }
}

export async function getWhatsAppAuthStatus() {
  requireDesktop();
  return invoke<WhatsAppAuthStatus>("whatsapp_auth_status");
}

export async function sendWhatsAppMessage(phoneNumber: string, text: string) {
  requireDesktop();
  if (!text.trim() || text.length > 4000) throw new Error("The WhatsApp message must contain between 1 and 4000 characters.");
  return invoke<Record<string, unknown>>("whatsapp_send_message", {
    phoneNumber: normalizeWhatsAppPhone(phoneNumber),
    text,
  });
}
