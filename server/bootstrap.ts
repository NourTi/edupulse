import { sql } from "drizzle-orm";
import { db } from "./db";

/**
 * Idempotent schema bootstrap.
 * Runs at startup on every boot. Safe to call repeatedly.
 *
 * Uses TiDB/MySQL 8's `ADD COLUMN IF NOT EXISTS` so it never errors on a
 * column that's already present. If the DB is ahead of the code (rare),
 * nothing happens. If it's behind, the missing columns are added.
 */
export async function runBootstrapMigrations() {
  const statements = [
    // users table — columns that were missing from production
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS linked_student_id VARCHAR(191) NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed TINYINT(1) NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS login_method VARCHAR(64) NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'active'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS open_id VARCHAR(191) NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'student'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_signed_in TIMESTAMP NULL`,

    // userAuthAccounts table — create if entirely missing
    `CREATE TABLE IF NOT EXISTS userAuthAccounts (
      id VARCHAR(191) PRIMARY KEY,
      userId INT NOT NULL,
      provider VARCHAR(32) NOT NULL,
      providerAccountId VARCHAR(191) NOT NULL,
      providerEmail VARCHAR(191) NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY userAuthAccounts_provider_account_idx (provider, providerAccountId),
      KEY userAuthAccounts_user_idx (userId)
    )`,
  ];

  for (const statement of statements) {
    try {
      await db.execute(sql.raw(statement));
      console.log(`[Bootstrap] OK: ${statement.slice(0, 80)}...`);
    } catch (error) {
      // Log and continue — one bad statement should not block the server.
      // Missing columns will still surface as a real error on login if the
      // ALTER actually failed for a non-benign reason.
      console.error(
        `[Bootstrap] FAILED: ${statement.slice(0, 80)}...`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log("[Bootstrap] Schema bootstrap complete.");
}
