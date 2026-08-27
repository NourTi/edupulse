import { describe, expect, it } from "vitest";
import { aboutAudiences, PROFILE_PDF_URL } from "./AboutSection";

describe("About section", () => {
  it("links to the platform profile PDF", () => {
    expect(PROFILE_PDF_URL).toBe("/manus-storage/main_8a3b9e44.pdf");
    expect(PROFILE_PDF_URL.endsWith(".pdf")).toBe(true);
  });

  it("covers the four intended EduPulse audience groups", () => {
    expect(aboutAudiences.map(audience => audience.en)).toEqual([
      "Private schools",
      "Language centres",
      "Independent educators",
      "University teams",
    ]);
    expect(aboutAudiences.every(audience => audience.ar && audience.en && audience.arText && audience.enText)).toBe(true);
  });
});
