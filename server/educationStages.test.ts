import { describe, expect, it } from "vitest";
import { ALGERIA_EDUCATION_STAGES, educationStageLabel } from "@shared/educationStages";

describe("Algeria education stages", () => {
  it("defines the complete preparatory-to-higher taxonomy", () => {
    expect(ALGERIA_EDUCATION_STAGES.map(stage => stage.id)).toEqual(["preparatory", "primary", "middle", "secondary", "higher"]);
  });

  it("provides Arabic and English labels", () => {
    expect(educationStageLabel("middle", true)).toBe("التعليم المتوسط");
    expect(educationStageLabel("higher", false)).toBe("Higher education");
  });
});
