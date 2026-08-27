import { describe, expect, it } from "vitest";
import { buildSupportEvaluation } from "./evaluation";

describe("support evaluation engine", () => {
  it("identifies subject gaps and attendance signals without provider access", async () => {
    const result = await buildSupportEvaluation({ stage: "المتوسط", language: "ar", useAi: false, assessments: [{ subject: "Mathematics", score: 35, assessmentType: "exam", assessedAt: new Date() }, { subject: "English", score: 82, assessmentType: "exam", assessedAt: new Date() }], attendance: [{ status: "absent" }, { status: "absent" }, { status: "present" }, { status: "late" }], cefr: [], records: [] });
    expect(result.supportLevel).toBe("urgent_review");
    expect(result.evidence.weakSubjects).toContain("Mathematics");
    expect(result.evidence.strongSubjects).toContain("English");
    expect(result.evidence.attendanceRate).toBe(50);
    expect(result.factors.join(" ")).toContain("Attendance signal");
    expect(result.recommendations.join(" ")).not.toContain("diagnos");
  });

  it("keeps a learner progressing when evidence is consistently strong", async () => {
    const result = await buildSupportEvaluation({ stage: "الثانوي", language: "en", useAi: false, assessments: [{ subject: "Physics", score: 90, assessmentType: "classwork", assessedAt: new Date() }, { subject: "Physics", score: 86, assessmentType: "exam", assessedAt: new Date() }], attendance: [{ status: "present" }, { status: "present" }], cefr: [], records: [] });
    expect(result.supportLevel).toBe("progressing");
    expect(result.evidence.strongSubjects).toContain("Physics");
    expect(result.summary).toContain("teacher");
  });
});
