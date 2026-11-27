import {
  BOT_INSTRUCTIONS_MAX_LENGTH,
  GROUP_MEMBER_MAX,
  GROUP_NAME_MAX_LENGTH,
  TeamTemplateSchema,
} from "@rakazo/contracts";
import { describe, expect, it } from "vitest";
import { looksLikeCredential } from "../agent-import/index.js";
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
    expect(ids).toEqual([
      "va-back-office",
      "night-shift-team",
      "va-business-team",
      "client-delegation-team",
      "client-va-pair",
      "finance-team",
      "marketing-team",
      "operations-team",
      "inbox-calendar-team",
      "va-agency-team",
    ]);
    expect(findTeamTemplate("finance-team")?.lead).toBe("month-end-close");
    expect(findTeamTemplate("missing")).toBeUndefined();
  });

  it("are job-sized: 4 to 6 single-role members, led by a coordinating lead", () => {
    for (const team of TEAM_TEMPLATES) {
      expect(team.members.length, team.id).toBeGreaterThanOrEqual(4);
      expect(team.members.length, team.id).toBeLessThanOrEqual(6);
      expect(team.members[0]!.role, team.id).toMatch(/^Leads the team: /);
      for (const member of team.members.slice(1)) {
        expect(member.role, `${team.id} ${member.templateId}`).not.toMatch(/^Leads/);
      }
    }
    expect(findTeamTemplate("va-back-office")?.lead).toBe("ai-brain-keeper");
  });

  it("each has a metric, a week-one plan, limits, approvals and setup inputs", () => {
    for (const team of TEAM_TEMPLATES) {
      expect(team.successMetric.name.trim(), team.id).not.toBe("");
      expect(team.successMetric.measure.trim(), team.id).not.toBe("");
      expect(team.weekOne.length, team.id).toBeGreaterThanOrEqual(3);
      expect(team.wontDo.length, team.id).toBeGreaterThanOrEqual(3);
      expect(team.approvals.length, team.id).toBeGreaterThanOrEqual(2);
      expect(team.setupInputs.length, team.id).toBeGreaterThanOrEqual(3);
      const names = team.setupInputs.map((input) => input.name);
      expect(new Set(names).size, team.id).toBe(names.length);
      const texts = [
        team.sample,
        ...team.whatItDoes,
        ...team.howItHelps,
        team.successMetric.measure,
        ...team.weekOne,
        ...team.wontDo,
        ...team.approvals,
        ...team.setupInputs.map((input) => input.detail),
      ];
      expect(texts.filter(looksLikeCredential), team.id).toEqual([]);
    }
  });

  it("gives the lead the setup inputs and metric to ask for first", () => {
    for (const team of TEAM_TEMPLATES) {
      const roster = team.members.map((member) => ({
        botId: member.templateId,
        botName: findBotTemplate(member.templateId)!.name,
        role: member.role,
        lead: member.templateId === team.lead,
      }));
      const lead = teamNote(team, roster, team.lead);
      expect(lead, team.id).toContain("Team setup (do this first)");
      team.setupInputs.forEach((input, index) => {
        expect(lead, team.id).toContain(`${index + 1}. ${input.name}: ${input.detail}`);
      });
      expect(lead, team.id).toContain(`Team success metric: ${team.successMetric.name}.`);
      for (const step of team.weekOne) expect(lead, team.id).toContain(`- ${step}`);
      for (const item of [...team.approvals, ...team.wontDo]) {
        expect(lead, team.id).toContain(`- ${item}`);
      }
      const other = teamNote(team, roster, team.members[1]!.templateId);
      expect(other, team.id).not.toContain("Team setup (do this first)");
      expect(other, team.id).toContain(`The team is judged by ${team.successMetric.name}.`);
    }
  });

  it("fit every member's instructions even with a note from every team it can join", () => {
    const notes = new Map<string, string[]>();
    for (const team of TEAM_TEMPLATES) {
      const roster = team.members.map((member) => ({
        botId: member.templateId,
        botName: findBotTemplate(member.templateId)!.name,
        role: member.role,
        lead: member.templateId === team.lead,
      }));
      for (const member of team.members) {
        const note = teamNote(team, roster, member.templateId);
        notes.set(member.templateId, [...(notes.get(member.templateId) ?? []), note]);
      }
    }
    for (const [templateId, teamNotes] of notes) {
      const total = [findBotTemplate(templateId)!.instructions, ...teamNotes].join("\n\n");
      expect(total.length, templateId).toBeLessThanOrEqual(BOT_INSTRUCTIONS_MAX_LENGTH);
    }
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
