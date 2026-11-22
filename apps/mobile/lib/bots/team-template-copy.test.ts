import { TEAM_TEMPLATES } from "@rakazo/core";
import { afterEach, describe, expect, it } from "vitest";
import { resetI18nForTests } from "../i18n/i18n";
import { teamTemplateCopy } from "./team-template-copy";

afterEach(() => resetI18nForTests());

/** Listing fields the copy function does not compare, filled so the type is complete. */
function listing(team: (typeof TEAM_TEMPLATES)[number]) {
  return {
    ...team,
    members: team.members.map((member) => ({
      ...member,
      name: member.templateId,
      botId: null,
    })),
    groupId: null,
  };
}

describe("teamTemplateCopy", () => {
  it("matches the server's English for every team", () => {
    resetI18nForTests("en");
    for (const team of TEAM_TEMPLATES) {
      const copy = teamTemplateCopy(listing(team));
      expect(copy.name).toBe(team.name);
      expect(copy.summary).toBe(team.summary);
      expect(copy.sample).toBe(team.sample);
      expect(copy.whatItDoes).toEqual(team.whatItDoes);
      expect(copy.howItHelps).toEqual(team.howItHelps);
      expect(copy.roles).toEqual(
        Object.fromEntries(team.members.map((member) => [member.templateId, member.role])),
      );
    }
  });

  it("shows the server's English for a team it does not know", () => {
    resetI18nForTests("de");
    const team = listing({ ...TEAM_TEMPLATES[0]!, id: "new-team", name: "New", summary: "S" });
    expect(teamTemplateCopy(team)).toMatchObject({ name: "New", summary: "S" });
  });
});
