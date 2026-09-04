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

  // Guard against the common Render misconfiguration where DATABASE_URL points to the
  // system `sys` database. TiDB's `sys` is read-only for the application user and
  // will always fail with ER_TABLEACCESS_DENIED_ERROR. Fail fast with a clear hint.
  const rawUrl = process.env.DATABASE_URL?.trim() ?? "";
  try {
    const parsed = new URL(rawUrl);
    const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    if (dbName.toLowerCase() === "sys") {
      console.error("[Database] DATABASE_URL points to the system `sys` database, which cannot store application tables. Change the URL path to a user-owned TiDB database (e.g. /edupulse or /<yourTiDBDatabase>) in Render's Environment and redeploy. See docs/portable-deployment.md.");
      throw new Error("DATABASE_URL must not target the `sys` database. Use a user-owned database name.");
    }
  } catch (error) {
    // If URL parsing itself fails, let the normal migration error surface.
    if (error instanceof Error && error.message.includes("system `sys` database")) throw error;
  }

  // TiDB accepts the MySQL-compatible integer form more reliably than the
  // `SERIAL` alias emitted by Drizzle's generic mysql2 migrator.
  await ensureTiDBMigrationTable(db);
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
  console.log("[Database] Startup migrations applied successfully.");
}
