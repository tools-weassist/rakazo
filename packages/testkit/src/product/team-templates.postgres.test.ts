import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Bot, Group, TeamTemplateListing } from "@rakazo/contracts";
import { findBotTemplate, findTeamTemplate } from "@rakazo/core";
import type { PrismaClient } from "@rakazo/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sessionCookieHeader } from "../index.js";
import { asSystem } from "../system-db.js";

type App = { request: (input: string, init?: RequestInit) => Response | Promise<Response> };
type TeamCreated = {
  group: Group;
  created: boolean;
  members: { templateId: string; bot: Bot; created: boolean; lead: boolean }[];
};

const hasDb = process.env.VERIFY_DATABASE === "1" && Boolean(process.env.DATABASE_URL);
const describeIntegration = hasDb ? describe : describe.skip;

const finance = findTeamTemplate("finance-team")!;
const marketing = findTeamTemplate("marketing-team")!;
const receipts = findBotTemplate("receipt-categorizer")!;

describeIntegration("team templates", () => {
  let app: App;
  let db: PrismaClient;
  let stop: () => Promise<void>;
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const dataDir = mkdtempSync(path.join(tmpdir(), "rakazo-team-templates-"));

  beforeAll(async () => {
    const { createApp } = await import("@rakazo/api/app");
    const handles = await createApp({
      databaseUrl: process.env.DATABASE_URL!,
      dataDir,
      sandboxProvider: "fake",
      agentRuntime: "scripted",
      wakeupDriver: "memory",
    });
    app = handles.app;
    db = asSystem(handles.prisma);
    stop = handles.stop;
  });

  afterAll(async () => {
    await stop?.();
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("makes the team once, reusing a bot a template already made, and repeats safely", async () => {
    const cookie = await signup(app, `team-${stamp}@rakazo.test`);
    const existing = await rpc<{ bot: Bot }>(app, cookie, "bots/createFromTemplate", {
      templateId: receipts.id,
      version: receipts.version,
    });

    const first = await rpc<TeamCreated>(app, cookie, "bots/createTeamFromTemplate", {
      teamId: finance.id,
      version: finance.version,
    });
    expect(first.created).toBe(true);
    expect(first.members.map((member) => [member.templateId, member.lead, member.created])).toEqual(
      [
        ["month-end-close", true, true],
        ["receipt-categorizer", false, false],
        ["expense-report-prep", false, true],
        ["ar-follow-up", false, true],
        ["cash-flow-snapshot", false, true],
      ],
    );
    expect(first.members[1]!.bot.id).toBe(existing.bot.id);
    expect(first.group.name).toBe("Finance team");
    expect(first.group.members.map((member) => member.botId)).toEqual(
      first.members.map((member) => member.bot.id),
    );
    const notes = await db.bot.findMany({
      where: { id: { in: first.members.map((member) => member.bot.id) } },
      select: { id: true, instructions: true },
    });
    for (const bot of notes) {
      expect(bot.instructions).toContain("<!-- team:finance-team -->");
      expect(bot.instructions.match(/## Your team: Finance team/g)).toHaveLength(1);
    }
    const owner0 = await ownerOf(app, cookie);
    const botsBefore = await db.bot.count({ where: { spaceId: owner0.spaceId, archivedAt: null } });
    const history = () =>
      db.bot.findMany({
        where: { id: { in: notes.map((bot) => bot.id) } },
        select: { id: true, instructions: true, instructionHistory: true },
        orderBy: { id: "asc" },
      });
    const before = await history();

    const again = await rpc<TeamCreated>(app, cookie, "bots/createTeamFromTemplate", {
      teamId: finance.id,
      version: finance.version,
    });
    expect(again.created).toBe(false);
    expect(again.group.id).toBe(first.group.id);
    expect(again.members.every((member) => !member.created)).toBe(true);
    const owner = await ownerOf(app, cookie);
    expect(await db.chatGroup.count({ where: { ...owner, archivedAt: null } })).toBe(1);
    expect(await db.bot.count({ where: { spaceId: owner.spaceId, archivedAt: null } })).toBe(
      botsBefore,
    );
    // A repeat writes no new instruction versions.
    expect(await history()).toEqual(before);

    const listed = await rpc<TeamTemplateListing[]>(app, cookie, "bots/teamTemplates");
    const team = listed.find((item) => item.id === finance.id)!;
    expect(team.groupId).toBe(first.group.id);
    expect(team.members.every((member) => member.botId)).toBe(true);

    // An archived group gives way to a new one with the same bots.
    await db.chatGroup.update({ where: { id: first.group.id }, data: { archivedAt: new Date() } });
    const fresh = await rpc<TeamCreated>(app, cookie, "bots/createTeamFromTemplate", {
      teamId: finance.id,
      version: finance.version,
    });
    expect(fresh.created).toBe(true);
    expect(fresh.group.id).not.toBe(first.group.id);
    expect(fresh.members.map((member) => member.bot.id)).toEqual(
      first.members.map((member) => member.bot.id),
    );
  });

  it("makes one team when two creates race", async () => {
    const cookie = await signup(app, `team-race-${stamp}@rakazo.test`);
    const owner = await ownerOf(app, cookie);
    const before = await db.bot.count({ where: { spaceId: owner.spaceId, archivedAt: null } });
    const input = { teamId: marketing.id, version: marketing.version };
    const results = await Promise.allSettled([
      rpc<TeamCreated>(app, cookie, "bots/createTeamFromTemplate", input),
      rpc<TeamCreated>(app, cookie, "bots/createTeamFromTemplate", input),
    ]);
    // A loser may be refused while the winner holds a member's create; a retry then finishes.
    const done = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
    const final =
      done[0] ?? (await rpc<TeamCreated>(app, cookie, "bots/createTeamFromTemplate", input));
    expect(await db.chatGroup.count({ where: { ...owner, archivedAt: null } })).toBe(1);
    expect(await db.bot.count({ where: { spaceId: owner.spaceId, archivedAt: null } })).toBe(
      before + marketing.members.length,
    );
    expect(final.group.members).toHaveLength(marketing.members.length);
  });
});

async function ownerOf(app: App, cookie: string) {
  const me = await rpc<{ userId: string; spaceId: string }>(app, cookie, "me");
  return { spaceId: me.spaceId, userId: me.userId };
}

async function signup(app: App, email: string) {
  const response = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://127.0.0.1:5173" },
    body: JSON.stringify({ email, password: "test-password-123", name: "Team User" }),
  });
  expect(response.status).toBeLessThan(400);
  return sessionCookieHeader(response);
}

async function rpc<T>(app: App, cookie: string, proc: string, body: unknown = {}): Promise<T> {
  const res = await app.request(`/rpc/${proc}`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie, origin: "http://127.0.0.1:5173" },
    body: JSON.stringify({ json: body }),
  });
  const text = await res.text();
  const parsed = JSON.parse(text) as { json?: T; error?: { message?: string } };
  if (res.status >= 400 || parsed.error) {
    throw new Error(`${proc} ${res.status}: ${parsed.error?.message ?? text}`);
  }
  return parsed.json as T;
}
