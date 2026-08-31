import { describe, expect, it } from "@jest/globals";

import { EMPTY_GROWTH_INTAKE } from "../../types/growthGuidance";
import {
  countWords,
  getGrowthAttemptFollowUps,
  getGrowthIntakeResumeStep,
} from "../growthGuidance";

describe("countWords", () => {
  it("counts words separated by mixed whitespace", () => {
    expect(countWords("  one two\nthree   four ")).toBe(4);
  });

  it("returns zero for an empty response", () => {
    expect(countWords("   ")).toBe(0);
  });
});

describe("getGrowthAttemptFollowUps", () => {
  it.each(["did_it", "partly"] as const)(
    "uses expectation choices after %s",
    (outcome) => {
      expect(getGrowthAttemptFollowUps(outcome).map(([value]) => value)).toEqual([
        "easier_than_expected",
        "about_the_same",
        "harder_than_expected",
        "not_sure",
        "other",
      ]);
    }
  );

  it("uses distinct opportunity and motivation choices after a non-attempt", () => {
    expect(getGrowthAttemptFollowUps("didnt_do_it").map(([value]) => value)).toEqual([
      "no_opportunity",
      "forgot",
      "too_uncomfortable",
      "not_relevant",
      "other",
    ]);
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
