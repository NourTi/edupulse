import path from "node:path";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { getDb } from "../db";

export function shouldRunStartupMigration(env: NodeJS.ProcessEnv = process.env) {
  return env.AUTO_MIGRATE === "true";
}

export async function runStartupMigration() {
  if (!shouldRunStartupMigration()) return;

  const db = await getDb();
  if (!db) throw new Error("AUTO_MIGRATE=true but DATABASE_URL is unavailable.");

  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
  console.log("[Database] Startup migrations applied successfully.");
}
