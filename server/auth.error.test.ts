import { describe, expect, it } from "vitest";
import { databaseSetupErrorPayload } from "./_core/index";

describe("authentication error responses", () => {
  it("returns a stable JSON-safe database setup error contract", () => {
    expect(databaseSetupErrorPayload()).toEqual({
      error: "Database setup failed. Check the Render service logs.",
      code: "DATABASE_SETUP_FAILED",
    });
  });
});
