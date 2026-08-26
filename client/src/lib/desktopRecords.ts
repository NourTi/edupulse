import { invoke } from "@tauri-apps/api/core";
import { isDesktopRuntime } from "./desktopRuntime";

type LocalDatabaseStatus = {
  encrypted: boolean;
  storage: string;
};

async function assertEncryptedDesktopStorage() {
  if (!isDesktopRuntime()) throw new Error("Encrypted desktop storage is unavailable in a browser.");
  const status = await invoke<LocalDatabaseStatus>("local_database_status");
  if (!status.encrypted) throw new Error("EduPulse refused to open an unencrypted desktop database.");
}

export async function loadDesktopWorkspace<T>(): Promise<T | null> {
  await assertEncryptedDesktopStorage();
  const payload = await invoke<string | null>("local_database_load");
  return payload ? (JSON.parse(payload) as T) : null;
}

export async function saveDesktopWorkspace(payload: unknown) {
  await assertEncryptedDesktopStorage();
  await invoke("local_database_save", {
    payload: JSON.stringify(payload),
    updatedAt: new Date().toISOString(),
  });
}
