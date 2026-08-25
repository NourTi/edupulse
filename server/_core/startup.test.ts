import { describe, expect, it } from "vitest";
import { shouldRunStartupMigration } from "./startup";

describe("startup migrations", () => {
  it("are disabled by default", () => {
    expect(shouldRunStartupMigration({})).toBe(false);
    expect(shouldRunStartupMigration({ AUTO_MIGRATE: "false" })).toBe(false);
  });

  it("run only when explicitly enabled", () => {
    expect(shouldRunStartupMigration({ AUTO_MIGRATE: "true" })).toBe(true);
    expect(shouldRunStartupMigration({ AUTO_MIGRATE: "TRUE" })).toBe(false);
  });
});
