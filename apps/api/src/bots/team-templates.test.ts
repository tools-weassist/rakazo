import type { Bot, BotTemplateListing, Group } from "@rakazo/contracts";
import { AgentImportCreateInput, BOT_INSTRUCTIONS_MAX_LENGTH } from "@rakazo/contracts";
import { BOT_TEMPLATES, findTeamTemplate } from "@rakazo/core";
import { describe, expect, it } from "vitest";
import type { TeamServices } from "./team-templates.js";
import { createTeamFromTemplate, listTeamTemplates, teamImportKey } from "./team-templates.js";

const finance = findTeamTemplate("finance-team")!;

/** An in-memory space: one bot per template, instructions, and the team's group. */
function fakeSpace(options: { failOn?: string; existing?: Record<string, string> } = {}) {
  const bots = new Map<string, { bot: Bot; instructions: string }>();
  const byTemplate = new Map<string, string>();
  let groups: { id: string; name: string; botIds: string[] }[] = [];
  let teamGroup: string | null = null;
  const calls = { created: 0, groupCreates: 0, failOn: options.failOn };
  for (const [templateId, name] of Object.entries(options.existing ?? {})) {
    const id = `bot-${templateId}`;
    bots.set(id, { bot: { id, name } as Bot, instructions: "Mine." });
    byTemplate.set(templateId, id);
  }
  const asGroup = (group: { id: string; name: string; botIds: string[] }) =>
    ({
      id: group.id,
      name: group.name,
      members: group.botIds.map((botId) => ({ botId, name: bots.get(botId)!.bot.name })),
    }) as Group;
  const services: TeamServices = {
    async createMember(templateId) {
      const found = byTemplate.get(templateId);
      if (found) return { bot: bots.get(found)!.bot, created: false };
      if (calls.failOn === templateId) throw new Error("provider down");
      const template = BOT_TEMPLATES.find((item) => item.id === templateId)!;
      const id = `bot-${templateId}`;
      bots.set(id, {
        bot: { id, name: template.name } as Bot,
        instructions: template.instructions,
      });
      byTemplate.set(templateId, id);
      calls.created++;
      return { bot: bots.get(id)!.bot, created: true };
    },
    async updateInstructions(botId, next) {
      const row = bots.get(botId)!;
      row.instructions = next(row.instructions);
    },
    async findGroup() {
      const group = groups.find((item) => item.id === teamGroup);
      return group ? asGroup(group) : null;
    },
    async ensureGroup(_teamId, name, botIds) {
      let group = groups.find((item) => item.id === teamGroup);
      let created = false;
      if (!group) {
        group = { id: `group-${++calls.groupCreates}`, name, botIds: [...botIds] };
        groups.push(group);
        teamGroup = group.id;
        created = true;
      }
      for (const id of botIds) if (!group.botIds.includes(id)) group.botIds.push(id);
      return { group: asGroup(group), created };
    },
  };
  return {
    services,
    bots,
    calls,
    archiveGroup: () => {
      groups = groups.filter((group) => group.id !== teamGroup);
    },
    dropMember: (templateId: string) => {
      const id = byTemplate.get(templateId)!;
      byTemplate.delete(templateId);
      for (const group of groups) group.botIds = group.botIds.filter((item) => item !== id);
      bots.delete(id);
    },
  };
}

describe("createTeamFromTemplate", () => {
  it("makes every member lead first, notes the team in each, and opens one group", async () => {
    const space = fakeSpace();
    const result = await createTeamFromTemplate(space.services, {
      teamId: finance.id,
      version: finance.version,
    });
    expect(result.created).toBe(true);
    expect(
      result.members.map((member) => [member.templateId, member.lead, member.created]),
    ).toEqual([
      ["month-end-close", true, true],
      ["receipt-categorizer", false, true],
      ["ar-follow-up", false, true],
      ["cash-flow-snapshot", false, true],
    ]);
    expect(result.group.members.map((member) => member.name)).toEqual([
      "Month-end close",
      "Receipt sorter",
      "Invoice follow-up",
      "Cash-flow snapshot",
    ]);
    const lead = space.bots.get("bot-month-end-close")!.instructions;
    expect(lead).toContain("## Your team: Finance team");
    expect(lead).toContain("You're the lead.");
    const member = space.bots.get("bot-ar-follow-up")!.instructions;
    expect(member).toContain("- Invoice follow-up (you):");
    expect(member).toContain("Month-end close is the lead and coordinates.");
  });

  it("returns the same team on a repeat, with no new bots, notes or groups", async () => {
    const space = fakeSpace();
    const input = { teamId: finance.id, version: finance.version };
    const first = await createTeamFromTemplate(space.services, input);
    const before = [...space.bots.values()].map((row) => row.instructions);
    const again = await createTeamFromTemplate(space.services, input);
    expect(again.created).toBe(false);
    expect(again.group.id).toBe(first.group.id);
    expect(again.members.every((member) => !member.created)).toBe(true);
    expect(space.calls).toMatchObject({ created: 4, groupCreates: 1 });
    expect([...space.bots.values()].map((row) => row.instructions)).toEqual(before);
  });

  it("reuses a member bot a template already made, keeping its own instructions", async () => {
    const space = fakeSpace({ existing: { "receipt-categorizer": "Receipts" } });
    const result = await createTeamFromTemplate(space.services, {
      teamId: finance.id,
      version: finance.version,
    });
    expect(
      result.members.find((member) => member.templateId === "receipt-categorizer"),
    ).toMatchObject({
      created: false,
      bot: { id: "bot-receipt-categorizer" },
    });
    expect(space.calls.created).toBe(3);
    const reused = space.bots.get("bot-receipt-categorizer")!.instructions;
    expect(reused.startsWith("Mine.\n\n<!-- team:finance-team -->")).toBe(true);
    // Teammates see the name the user gave it.
    expect(space.bots.get("bot-month-end-close")!.instructions).toContain("- Receipts: ");
  });

  it("keeps the bots made before a failure, and finishes the team on the next try", async () => {
    const space = fakeSpace({ failOn: "ar-follow-up" });
    const input = { teamId: finance.id, version: finance.version };
    await expect(createTeamFromTemplate(space.services, input)).rejects.toMatchObject({
      data: { reason: "team_partial", made: 2 },
    });
    expect([...space.bots.keys()]).toEqual(["bot-month-end-close", "bot-receipt-categorizer"]);
    expect(space.calls.groupCreates).toBe(0);
    space.calls.failOn = undefined;
    const result = await createTeamFromTemplate(space.services, input);
    expect(result.members.map((member) => member.created)).toEqual([false, false, true, true]);
    expect(space.calls).toMatchObject({ created: 4, groupCreates: 1 });
  });

  it("makes a missing member again and adds it back, or opens a new group if it was archived", async () => {
    const space = fakeSpace();
    const input = { teamId: finance.id, version: finance.version };
    const first = await createTeamFromTemplate(space.services, input);
    space.dropMember("cash-flow-snapshot");
    const repaired = await createTeamFromTemplate(space.services, input);
    expect(repaired.group.id).toBe(first.group.id);
    expect(repaired.group.members.map((member) => member.botId)).toContain(
      "bot-cash-flow-snapshot",
    );
    space.archiveGroup();
    const fresh = await createTeamFromTemplate(space.services, input);
    expect(fresh.created).toBe(true);
    expect(fresh.group.id).not.toBe(first.group.id);
  });

  it("asks to shorten instructions rather than silently dropping the team note", async () => {
    const space = fakeSpace({ existing: { "receipt-categorizer": "Receipts" } });
    space.bots.get("bot-receipt-categorizer")!.instructions = "x".repeat(
      BOT_INSTRUCTIONS_MAX_LENGTH - 10,
    );
    await expect(
      createTeamFromTemplate(space.services, { teamId: finance.id, version: finance.version }),
    ).rejects.toMatchObject({ code: "CONFLICT", data: { reason: "team_instructions_too_long" } });
    expect(space.bots.get("bot-receipt-categorizer")!.instructions).toBe(
      "x".repeat(BOT_INSTRUCTIONS_MAX_LENGTH - 10),
    );
  });

  it("refuses an unknown team and an outdated preview", async () => {
    const space = fakeSpace();
    await expect(
      createTeamFromTemplate(space.services, { teamId: "missing", version: 1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      createTeamFromTemplate(space.services, { teamId: finance.id, version: finance.version + 1 }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED", data: { reason: "template_changed" } });
    expect(space.calls.created).toBe(0);
  });
});

describe("listTeamTemplates", () => {
  it("lists each team with its members' bots and its group", async () => {
    const templates = BOT_TEMPLATES.map((template) => ({
      ...template,
      botId: template.id === "receipt-categorizer" ? "bot-1" : null,
    })) as BotTemplateListing[];
    const listed = await listTeamTemplates(templates, {
      findGroup: async (teamId) =>
        teamId === "finance-team" ? ({ id: "group-1" } as Group) : null,
    });
    expect(listed.map((team) => [team.id, team.groupId])).toEqual([
      ["finance-team", "group-1"],
      ["marketing-team", null],
      ["va-back-office", null],
    ]);
    expect(listed[0]!.members[1]).toEqual({
      templateId: "receipt-categorizer",
      role: finance.members[1]!.role,
      name: "Receipt sorter",
      botId: "bot-1",
    });
  });
});

it("keeps team keys out of agent imports", () => {
  expect(teamImportKey("finance-team")).toBe("team:finance-team");
  const request = {
    files: [{ path: "SOUL.md", content: "Calm." }],
    name: "Imported",
    selection: { instructions: [], memory: [], skills: [] },
  };
  expect(
    AgentImportCreateInput.safeParse({ ...request, importKey: "team:finance-team" }).success,
  ).toBe(false);
});
