import { GROUP_MEMBER_MAX, GROUP_NAME_MAX_LENGTH, TeamTemplateSchema } from "@rakazo/contracts";
import { describe, expect, it } from "vitest";
import { findBotTemplate } from "./bot-templates.js";
import { findTeamTemplate, TEAM_TEMPLATES, teamNote, withTeamNote } from "./team-templates.js";

describe("team templates", () => {
  it("each validates, has a unique id, and names real bot templates with the lead first", () => {
    for (const team of TEAM_TEMPLATES) {
      expect(TeamTemplateSchema.parse(team)).toEqual(team);
      expect(team.name.length).toBeLessThanOrEqual(GROUP_NAME_MAX_LENGTH);
      expect(team.members.length).toBeLessThanOrEqual(GROUP_MEMBER_MAX);
      expect(team.members[0]?.templateId).toBe(team.lead);
      for (const member of team.members) {
        expect(findBotTemplate(member.templateId), member.templateId).toBeDefined();
      }
    }
    const ids = TEAM_TEMPLATES.map((team) => team.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(["finance-team", "marketing-team", "va-back-office"]);
    expect(findTeamTemplate("finance-team")?.lead).toBe("month-end-close");
    expect(findTeamTemplate("missing")).toBeUndefined();
  });

  it("refuses a team whose lead is not first", () => {
    const team = TEAM_TEMPLATES[0]!;
    expect(
      TeamTemplateSchema.safeParse({ ...team, members: [...team.members].reverse() }).success,
    ).toBe(false);
  });

  const members = [
    { botId: "lead", botName: "Month-end close", role: "Leads.", lead: true },
    { botId: "other", botName: "Receipt sorter", role: "Sorts receipts.", lead: false },
  ];

  it("tells the lead to coordinate and the others to report to the lead, with a loop limit", () => {
    const lead = teamNote({ id: "finance-team", name: "Finance team" }, members, "lead");
    expect(lead).toContain("- Month-end close (lead) (you): Leads.");
    expect(lead).toContain("You're the lead.");
    const other = teamNote({ id: "finance-team", name: "Finance team" }, members, "other");
    expect(other).toContain("- Receipt sorter (you): Sorts receipts.");
    expect(other).toContain("Month-end close is the lead and coordinates.");
    for (const note of [lead, other]) {
      expect(note).toContain("Never send acknowledgements");
      expect(note).toContain("past 3 messages");
      expect(note.startsWith("<!-- team:finance-team -->")).toBe(true);
      expect(note.endsWith("<!-- /team:finance-team -->")).toBe(true);
    }
  });

  it("adds the note once and replaces it in place when the team changes", () => {
    const note = teamNote({ id: "finance-team", name: "Finance team" }, members, "other");
    const once = withTeamNote("You sort receipts.\n", "finance-team", note);
    expect(once).toBe(`You sort receipts.\n\n${note}`);
    expect(withTeamNote(once, "finance-team", note)).toBe(once);
    const renamed = teamNote(
      { id: "finance-team", name: "Finance team" },
      [members[0]!, { ...members[1]!, botName: "Receipts" }],
      "other",
    );
    const edited = `${once}\n\nUser's own line.`;
    expect(withTeamNote(edited, "finance-team", renamed)).toBe(
      `You sort receipts.\n\n${renamed}\n\nUser's own line.`,
    );
    expect(withTeamNote("", "finance-team", note)).toBe(note);
  });
});
