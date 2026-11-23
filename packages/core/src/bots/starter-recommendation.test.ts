import {
  SIGNUP_SURVEY_BRAINS,
  SIGNUP_SURVEY_NEEDS,
  SIGNUP_SURVEY_ROLE_DETAILS,
  SIGNUP_SURVEY_ROLES,
} from "@rakazo/contracts";
import { describe, expect, it } from "vitest";
import { recommendStarter, starterTemplate } from "./starter-recommendation.js";

describe("recommendStarter", () => {
  it("keeps today's flow when the role is skipped", () => {
    expect(recommendStarter({})).toBeNull();
    expect(recommendStarter({ brain: "drive", needs: [] })).toBeNull();
  });

  it.each([
    [{ role: "business_owner", roleDetail: "has_va" }, "team", "client-delegation-team"],
    [{ role: "business_owner", roleDetail: "has_va", brain: "drive" }, "team", "client-va-pair"],
    [{ role: "business_owner", roleDetail: "hiring", brain: "unsure" }, "bot", "ai-brain-keeper"],
    [{ role: "business_owner", roleDetail: "hiring", brain: "notion" }, "bot", "sop-builder"],
    [
      { role: "business_owner", roleDetail: "solo", needs: ["email"] },
      "team",
      "inbox-calendar-team",
    ],
    [{ role: "business_owner", needs: ["money", "email"] }, "bot", "ar-follow-up"],
    [{ role: "business_owner" }, "bot", "morning-briefing"],
    [{ role: "va", roleDetail: "one_client" }, "bot", "ai-brain-keeper"],
    [{ role: "va", roleDetail: "one_client", brain: "assistant" }, "bot", "results-eod-report"],
    [
      { role: "va", roleDetail: "one_client", needs: ["eod", "handoffs"] },
      "team",
      "night-shift-team",
    ],
    [{ role: "va", roleDetail: "many_clients", brain: "none" }, "team", "va-back-office"],
    [{ role: "va", roleDetail: "many_clients", brain: "other" }, "team", "night-shift-team"],
    [{ role: "va", roleDetail: "seeking" }, "team", "va-business-team"],
    [{ role: "va", roleDetail: "seeking", needs: ["ai_skills"] }, "bot", "ai-upskill-coach"],
    [{ role: "agency", roleDetail: "6-20" }, "team", "va-agency-team"],
    [{ role: "exploring" }, "bot", "morning-briefing"],
  ] as const)("%o starts with %s %s", (survey, kind, id) => {
    expect(
      recommendStarter({ ...survey, needs: "needs" in survey ? [...survey.needs] : [] }),
    ).toEqual({
      kind,
      id,
    });
  });

  it("only ever picks a real template, and never Inbox triage", () => {
    for (const role of SIGNUP_SURVEY_ROLES) {
      for (const roleDetail of [undefined, ...SIGNUP_SURVEY_ROLE_DETAILS[role]]) {
        for (const brain of [undefined, ...SIGNUP_SURVEY_BRAINS]) {
          for (const need of [undefined, ...SIGNUP_SURVEY_NEEDS[role]]) {
            const pick = recommendStarter({ role, roleDetail, brain, needs: need ? [need] : [] });
            expect(pick).not.toBeNull();
            expect(pick?.id).not.toBe("inbox-triage");
            expect(starterTemplate(pick!), JSON.stringify(pick)).toBeDefined();
          }
        }
      }
    }
  });
});
