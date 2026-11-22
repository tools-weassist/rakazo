import { ORPCError } from "@orpc/server";
import type { Actor, Bot, BotTemplateListing, Group, TeamTemplateListing } from "@rakazo/contracts";
import {
  BOT_INSTRUCTIONS_MAX_LENGTH,
  BOT_TEMPLATE_CHANGED,
  GROUP_MEMBER_MAX,
  GROUP_MEMBER_MIN,
  TEAM_TEMPLATE_IMPORT_KEY_PREFIX,
} from "@rakazo/contracts";
import {
  findBotTemplate,
  findTeamTemplate,
  TEAM_TEMPLATES,
  teamNote,
  withTeamNote,
} from "@rakazo/core";
import type { createGroupRepos, PrismaClient } from "@rakazo/db";
import { commitBotUpdate, InstructionConflictError, IsolationError } from "@rakazo/db";
import { getLogger } from "@rakazo/logging";

/** A team keeps its group in an agent-import row under this key, owned by the lead's bot. */
export function teamImportKey(teamId: string): string {
  return `${TEAM_TEMPLATE_IMPORT_KEY_PREFIX}${teamId}`;
}

/**
 * Everything a team create touches, so the flow can be checked without a database. Each step
 * is idempotent on its own: members come from their templates' own one-bot-per-template
 * records, the note is replaced in place, and the group is found again through the record.
 */
export type TeamServices = {
  /** Makes a member's bot from its template, or returns the bot that template already made. */
  createMember: (templateId: string, version: number) => Promise<{ bot: Bot; created: boolean }>;
  /** Rewrites one bot's instructions from what they are now; a no-op when nothing changes. */
  updateInstructions: (botId: string, next: (current: string) => string) => Promise<void>;
  findGroup: (teamId: string) => Promise<Group | null>;
  /** Atomically finds or creates the group and its team record, then repairs missing members. */
  ensureGroup: (
    teamId: string,
    name: string,
    botIds: string[],
  ) => Promise<{ group: Group; created: boolean }>;
};

export async function listTeamTemplates(
  templates: readonly BotTemplateListing[],
  services: Pick<TeamServices, "findGroup">,
): Promise<TeamTemplateListing[]> {
  const made = new Map(templates.map((template) => [template.id, template.botId]));
  return Promise.all(
    TEAM_TEMPLATES.map(async (team) => {
      const group = await services.findGroup(team.id);
      return {
        id: team.id,
        version: team.version,
        name: team.name,
        summary: team.summary,
        sample: team.sample,
        lead: team.lead,
        members: team.members.map((member) => ({
          templateId: member.templateId,
          role: member.role,
          name: findBotTemplate(member.templateId)?.name ?? member.templateId,
          botId: made.get(member.templateId) ?? null,
        })),
        groupId: group?.id ?? null,
      };
    }),
  );
}

/**
 * Makes a team: each member's bot (reusing any its template already made), a "your team" note
 * in every member's instructions, and one group chat with the lead first. Safe to repeat: a
 * create that stopped partway is finished by the next one, and a finished team is returned
 * with any member that went missing made again and added back.
 */
export async function createTeamFromTemplate(
  services: TeamServices,
  input: { teamId: string; version: number },
) {
  const team = findTeamTemplate(input.teamId);
  if (!team) throw new ORPCError("NOT_FOUND", { message: "No team template has that id." });
  if (team.version !== input.version) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "This team changed. Look at it again before creating it.",
      data: { reason: BOT_TEMPLATE_CHANGED },
    });
  }

  // 1. Members, lead first. Each create is its own transaction and returns the existing bot on
  // a retry, so a failure here leaves the members made so far for the next attempt to reuse.
  const members: { templateId: string; role: string; lead: boolean; bot: Bot; created: boolean }[] =
    [];
  for (const member of team.members) {
    const template = findBotTemplate(member.templateId);
    if (!template) throw new Error(`Team ${team.id} names a missing template`);
    try {
      const made = await services.createMember(template.id, template.version);
      members.push({ ...member, lead: member.templateId === team.lead, ...made });
    } catch (error) {
      getLogger().warn("team member create failed", {
        teamId: team.id,
        templateId: member.templateId,
        made: members.length,
      });
      if (error instanceof ORPCError && members.length === 0) throw error;
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: `Made ${members.length} of ${team.members.length} bots for the ${team.name}. Try again to finish; the bots already made are kept.`,
        data: { reason: "team_partial", made: members.length },
        cause: error,
      });
    }
  }

  // 2. Each member's "your team" note, with the names the bots really have.
  const roster = members.map((member) => ({
    botId: member.bot.id,
    botName: member.bot.name,
    role: member.role,
    lead: member.lead,
  }));
  for (const member of members) {
    const note = teamNote(team, roster, member.bot.id);
    await services.updateInstructions(member.bot.id, (current) => {
      const next = withTeamNote(current, team.id, note);
      if (next.length > BOT_INSTRUCTIONS_MAX_LENGTH) {
        throw new ORPCError("CONFLICT", {
          message: `The instructions for ${member.bot.name} are too long to add the team note. Shorten them, then try again; the bots already made are kept.`,
          data: { reason: "team_instructions_too_long", botId: member.bot.id },
        });
      }
      return next;
    });
  }

  // 3. The group, found again through the team's record.
  const botIds = members.map((member) => member.bot.id);
  const { group, created } = await services.ensureGroup(team.id, team.name, botIds);
  return {
    group,
    created,
    members: members.map(({ templateId, lead, bot, created: made }) => ({
      templateId,
      lead,
      bot,
      created: made,
    })),
  };
}

/** The team services on the real database, for one actor. */
export function prismaTeamServices(deps: {
  prisma: PrismaClient;
  groupRepos: ReturnType<typeof createGroupRepos>;
  actor: Actor;
  notify: (threadId: string, seq: number) => Promise<void>;
  createMember: TeamServices["createMember"];
}): TeamServices {
  const { prisma, groupRepos, actor } = deps;
  const owner = { spaceId: actor.spaceId, userId: actor.userId };
  const openGroup = async (groupId: string) => {
    try {
      return groupRepos.mapGroup(await groupRepos.getGroup(actor, groupId));
    } catch (error) {
      if (error instanceof IsolationError) return null;
      throw error;
    }
  };
  return {
    createMember: deps.createMember,
    async updateInstructions(botId, next) {
      // One retry covers an edit that landed between the read and the write.
      for (let attempt = 0; ; attempt++) {
        const bot = await prisma.bot.findFirst({
          where: { id: botId, spaceId: actor.spaceId, archivedAt: null },
          select: { instructions: true, thread: { select: { id: true } } },
        });
        if (!bot?.thread) throw new IsolationError();
        const instructions = next(bot.instructions);
        if (instructions === bot.instructions) return;
        try {
          await commitBotUpdate({
            prisma,
            notify: deps.notify,
            spaceId: actor.spaceId,
            threadId: bot.thread.id,
            botId,
            emitBotUpdated: false,
            expectedInstructions: bot.instructions,
            reason: "Team template",
            data: { instructions },
          });
          return;
        } catch (error) {
          if (!(error instanceof InstructionConflictError) || attempt > 0) throw error;
        }
      }
    },
    async findGroup(teamId) {
      const record = await prisma.agentImport.findFirst({
        where: { ...owner, importKey: teamImportKey(teamId), source: "team" },
        select: { created: true },
      });
      const groupId = readGroupId(record?.created);
      return groupId ? openGroup(groupId) : null;
    },
    async ensureGroup(teamId, name, botIds) {
      const key = teamImportKey(teamId);
      // The group and pointer commit together. The advisory lock serializes creates even before
      // a record exists. A failed transaction leaves neither a group nor a pointer to repair.
      const result = await prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${actor.spaceId}:${actor.userId}:${key}`}, 0))`;
          const record = await tx.agentImport.findFirst({ where: { ...owner, importKey: key } });
          const groupId = readGroupId(record?.created);
          const existing = groupId
            ? await tx.chatGroup.findFirst({
                where: { id: groupId, spaceId: actor.spaceId, archivedAt: null },
                select: {
                  id: true,
                  thread: { select: { id: true } },
                  members: { select: { bot: { select: { archivedAt: true } } } },
                },
              })
            : null;
          // A group left with too few active bots can't be opened; the team gets a fresh one.
          const usable =
            existing?.thread &&
            existing.members.filter((member) => member.bot.archivedAt === null).length >=
              GROUP_MEMBER_MIN;
          if (existing && usable) return { groupId: existing.id, created: false };
          const group = await groupRepos.createGroup(actor, { name, botIds }, tx);
          await tx.agentImport.upsert({
            where: { spaceId_userId_importKey: { ...owner, importKey: key } },
            create: {
              ...owner,
              botId: botIds[0]!,
              source: "team",
              importKey: key,
              requestDigest: key,
              created: { mcpServers: [], team: { groupId: group.id } },
            },
            update: {
              botId: botIds[0]!,
              created: { mcpServers: [], team: { groupId: group.id } },
            },
          });
          return { groupId: group.id, created: true };
        },
        { timeout: 15_000 },
      );
      // Repair a missing member without replacing anyone the user added. The roster check
      // refuses a concurrent user edit, leaving the whole team resumable on the next attempt.
      const loaded = await groupRepos.getGroup(actor, result.groupId);
      const group = groupRepos.mapGroup(loaded);
      const active = group.members.map((member) => member.botId);
      const ids = [...botIds, ...active.filter((id) => !botIds.includes(id))];
      if (ids.length > GROUP_MEMBER_MAX) {
        throw new ORPCError("CONFLICT", {
          message: "This group is full. Make room for its missing team members, then try again.",
        });
      }
      if (botIds.some((id) => !active.includes(id))) {
        const updated = await groupRepos.updateGroup(actor, {
          groupId: group.id,
          botIds: ids,
          expectedBotIds: active,
        });
        return { group: updated.group, created: result.created };
      }
      return { group, created: result.created };
    },
  };
}

function readGroupId(value: unknown): string | null {
  if (!value || typeof value !== "object" || !("team" in value)) return null;
  const team = value.team;
  return team && typeof team === "object" && "groupId" in team && typeof team.groupId === "string"
    ? team.groupId
    : null;
}
