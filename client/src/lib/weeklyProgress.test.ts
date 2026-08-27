import { describe, expect, it } from "vitest";
import { buildWeeklyProgressMessage } from "./weeklyProgress";

describe("weekly progress summaries", () => {
  it("includes only the supplied student and assessment values", () => {
    const summary = buildWeeklyProgressMessage({
      studentName: "أمل بن يحيى",
      grade: "Year 10",
      attendance: 94,
      level: "B2",
      speaking: 84,
      listening: 88,
      reading: 91,
      writing: 79,
      note: "مراجعة الكتابة الأكاديمية.",
    });
    expect(summary).toContain("أمل بن يحيى");
    expect(summary).toContain("94%");
    expect(summary).toContain("B2");
    expect(summary).toContain("متوسط المهارات: 86%");
    expect(summary).toContain("مراجعة الكتابة الأكاديمية.");
  });
});
