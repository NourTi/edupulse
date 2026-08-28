import { describe, expect, it } from "vitest";
import { DRIZZLE_MIGRATIONS_TABLE_SQL, shouldRunStartupMigration } from "./startup";

describe("startup migrations", () => {
  it("are disabled by default", () => {
    expect(shouldRunStartupMigration({})).toBe(false);
    expect(shouldRunStartupMigration({ AUTO_MIGRATE: "false" })).toBe(false);
  });

  it("run only when explicitly enabled", () => {
    expect(shouldRunStartupMigration({ AUTO_MIGRATE: "true" })).toBe(true);
    expect(shouldRunStartupMigration({ AUTO_MIGRATE: "TRUE" })).toBe(false);
  });

  it("defines a TiDB-compatible migration metadata table", () => {
    expect(DRIZZLE_MIGRATIONS_TABLE_SQL).toContain("CREATE TABLE IF NOT EXISTS");
    expect(DRIZZLE_MIGRATIONS_TABLE_SQL).toContain("id INT AUTO_INCREMENT");
    expect(DRIZZLE_MIGRATIONS_TABLE_SQL).toContain("__drizzle_migrations");
    expect(DRIZZLE_MIGRATIONS_TABLE_SQL).not.toContain("SERIAL");
  });
});
