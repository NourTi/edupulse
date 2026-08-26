import { describe, expect, it } from "vitest";
import { postHeroModules } from "./PostHeroModuleStrip";
import { gradebookAverage } from "./GradebookPanel";

describe("post-hero CRM redesign", () => {
  it("exposes the core school workflows as visible modules", () => {
    const ids = postHeroModules.map(module => module.id);
    expect(ids).toEqual(expect.arrayContaining(["overview", "attendance", "payments", "guardians", "subjects", "registration", "crm", "learners", "cefr", "reports", "portal", "ask"]));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps Arabic labels available for every module", () => {
    expect(postHeroModules.every(module => module.ar.trim().length > 0)).toBe(true);
  });

  it("calculates a gradebook average only from recorded skills", () => {
    expect(gradebookAverage({ studentId: "s-001", level: "B2", speaking: 84, listening: 88, reading: 91, writing: 79, note: "", date: "2026-08-18" })).toBe(86);
    expect(gradebookAverage()).toBeNull();
  });
});
