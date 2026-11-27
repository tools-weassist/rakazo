import { describe, expect, it } from "vitest";
import { signupSurveyAnswers } from "./signup-survey";

describe("signup survey answers", () => {
  it("sends an empty survey when everything is blank", () => {
    expect(signupSurveyAnswers({ needs: [undefined], source: "  " })).toEqual({});
  });

  it("keeps the persona, brain and distinct needs, and trims the source", () => {
    expect(
      signupSurveyAnswers({
        role: "va",
        roleDetail: "seeking",
        brain: "none",
        needs: ["find_clients", "find_clients"],
        source: " A friend ",
      }),
    ).toEqual({
      role: "va",
      roleDetail: "seeking",
      brain: "none",
      needs: ["find_clients"],
      source: "A friend",
    });
  });

  it("drops a follow-up or need without a role", () => {
    expect(
      signupSurveyAnswers({ roleDetail: "solo", brain: "drive", needs: ["email"], source: "" }),
    ).toEqual({ brain: "drive" });
  });
});
