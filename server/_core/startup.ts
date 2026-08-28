import path from "node:path";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { getDb } from "../db";

export const DRIZZLE_MIGRATIONS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (id INT AUTO_INCREMENT NOT NULL, hash TEXT NOT NULL, created_at BIGINT, PRIMARY KEY (id))`;

export async function ensureTiDBMigrationTable(db: { execute: (query: ReturnType<typeof sql.raw>) => Promise<unknown> }) {
  await db.execute(sql.raw(DRIZZLE_MIGRATIONS_TABLE_SQL));
}

export function shouldRunStartupMigration(env: NodeJS.ProcessEnv = process.env) {
  return env.AUTO_MIGRATE === "true";
}

export async function runStartupMigration() {
  if (!shouldRunStartupMigration()) return;

  const db = await getDb();
  if (!db) throw new Error("AUTO_MIGRATE=true but DATABASE_URL is unavailable.");

  // TiDB accepts the MySQL-compatible integer form more reliably than the
  // `SERIAL` alias emitted by Drizzle's generic mysql2 migrator.
  await ensureTiDBMigrationTable(db);
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
  console.log("[Database] Startup migrations applied successfully.");
}
