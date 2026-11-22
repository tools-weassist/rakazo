import * as z from "zod";
import { GroupSchema } from "../spaces/groups.js";
import { BotSchema } from "./bot.js";

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(64);

/**
 * A reviewed team of bot templates that work together: creating it makes each member's bot (or
 * reuses the one a template already made), tells every member who does what, and opens a group
 * chat with all of them. The lead coordinates.
 */
export const TeamTemplateSchema = z
  .strictObject({
    id: slug,
    /** Bumped on any content change, so a create from an older preview is refused. */
    version: z.number().int().positive(),
    name: z.string().min(1).max(80),
    /** One line. */
    summary: z.string().min(1).max(120),
    /** Markdown: how the team works together, shown before anything is created. */
    sample: z.string().min(1).max(2000),
    /** The lead's bot template; it is listed first and coordinates the rest. */
    lead: slug,
    members: z
      .array(
        z.strictObject({
          templateId: slug,
          /** One line on what this member does for the team. */
          role: z.string().min(1).max(160),
        }),
      )
      .min(2)
      .max(10),
  })
  .refine((team) => team.members[0]?.templateId === team.lead, {
    error: "The lead comes first",
  })
  .refine((team) => new Set(team.members.map((m) => m.templateId)).size === team.members.length, {
    error: "Members must be distinct",
  });
export type TeamTemplate = z.infer<typeof TeamTemplateSchema>;

export const TeamTemplateListingSchema = z.object({
  id: slug,
  version: z.number().int().positive(),
  name: z.string(),
  summary: z.string(),
  sample: z.string(),
  lead: slug,
  members: z.array(
    z.object({
      templateId: slug,
      role: z.string(),
      /** The member template's bot name, as the server's English. */
      name: z.string(),
      /** The bot that member's template already made, while it exists; it joins the team. */
      botId: z.string().nullable(),
    }),
  ),
  /** The team's group chat from an earlier create, while it can be opened. */
  groupId: z.string().nullable(),
});
export type TeamTemplateListing = z.infer<typeof TeamTemplateListingSchema>;

export const CreateTeamFromTemplateInput = z.strictObject({
  teamId: slug,
  /** The version the user saw. */
  version: z.number().int().positive(),
});

export const CreateTeamFromTemplateOutput = z.object({
  group: GroupSchema,
  members: z.array(
    z.object({ templateId: slug, bot: BotSchema, created: z.boolean(), lead: z.boolean() }),
  ),
  /** False when the team's group already existed and was returned (with any missing members). */
  created: z.boolean(),
});

/** The import key a team's record is kept under; agent imports cannot use it. */
export const TEAM_TEMPLATE_IMPORT_KEY_PREFIX = "team:";
