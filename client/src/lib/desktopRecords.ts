import { isDesktopRuntime } from "./desktopRuntime";
import type Database from "@tauri-apps/plugin-sql";

let databasePromise: Promise<Database> | null = null;

async function database() {
  if (!isDesktopRuntime()) throw new Error("Desktop SQLite is unavailable in a browser.");
  const { default: Database } = await import("@tauri-apps/plugin-sql");
  if (!databasePromise) databasePromise = Database.load("sqlite:edupulse.db");
  const db = await databasePromise;
  await db.execute("CREATE TABLE IF NOT EXISTS workspace_records (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL)");
  return db;
}

export async function loadDesktopWorkspace<T>(): Promise<T | null> {
  const db = await database();
  const records = await db.select<Array<{ payload: string }>>("SELECT payload FROM workspace_records WHERE id = 'main' LIMIT 1");
  if (!records[0]?.payload) return null;
  return JSON.parse(records[0].payload) as T;
}

export async function saveDesktopWorkspace(payload: unknown) {
  const db = await database();
  await db.execute(
    "INSERT INTO workspace_records (id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at",
    ["main", JSON.stringify(payload), new Date().toISOString()],
  );
}
