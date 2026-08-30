import { getDb } from "../db";

export function shouldRunStartupMigration(env: NodeJS.ProcessEnv = process.env) {
  return env.AUTO_MIGRATE === "true";
}

export async function runStartupMigration() {
  if (!shouldRunStartupMigration()) {
    console.log("[Database] AUTO_MIGRATE disabled. Skipping.");
    return;
  }
  console.log("[Database] AUTO_MIGRATE enabled but migrations applied manually.");
}
