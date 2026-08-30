import { EMPTY_GROWTH_INTAKE } from "../../types/growthGuidance";
import { countWords, getGrowthIntakeResumeStep } from "../growthGuidance";

describe("countWords", () => {
  it("counts words separated by mixed whitespace", () => {
    expect(countWords("  one two\nthree   four ")).toBe(4);
  });

  it("returns zero for an empty response", () => {
    expect(countWords("   ")).toBe(0);
  });
});

describe("getGrowthIntakeResumeStep", () => {
  it("returns to the first unanswered question group", () => {
    expect(getGrowthIntakeResumeStep(EMPTY_GROWTH_INTAKE)).toBe("situation");
    expect(
      getGrowthIntakeResumeStep({
        ...EMPTY_GROWTH_INTAKE,
        current_situation: "I wait too long to contribute in meetings.",
        recent_example: "Yesterday my point was raised after I stayed quiet.",
      })
    ).toBe("direction");
  });

  it("returns to boundaries after every earlier group was autosaved", () => {
    expect(
      getGrowthIntakeResumeStep({
        ...EMPTY_GROWTH_INTAKE,
        current_situation: "situation",
        recent_example: "example",
        desired_change: "change",
        why_it_matters: "reason",
        prior_attempts: "attempts",
        likely_barriers: "barriers",
        practice_context: "context",
        disliked_guidance: "dislikes",
      })
    ).toBe("boundaries");
  });
});
