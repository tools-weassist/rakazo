import * as z from "zod";
import { GroupSchema } from "../spaces/groups.js";
import { BotSchema } from "./bot.js";

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(64);

const line = (max: number) => z.string().min(1).max(max);

/**
 * What a team promises and needs, shown on its detail page before anything is created. The
 * lead gets the setup inputs and the metric in its team note and asks for the inputs first.
 */
export const TeamTemplateBriefSchema = z.strictObject({
  /** The one number the team is judged by, and how the lead measures it. */
  successMetric: z.strictObject({ name: line(80), measure: line(300) }),
  /** The first week, one step per entry, in order. */
  weekOne: z.array(line(240)).min(3).max(7),
  /** What the team never does, so the owner knows the limits up front. */
  wontDo: z.array(line(200)).min(3).max(8),
  /** Every kind of yes the team will ask the owner for. */
  approvals: z.array(line(200)).min(2).max(8),
  /** What the owner fills in first; the lead asks for each one in its first chat. */
  setupInputs: z
    .array(z.strictObject({ name: line(60), detail: line(240) }))
    .min(3)
    .max(8),
});
export type TeamTemplateBrief = z.infer<typeof TeamTemplateBriefSchema>;

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
    ...TeamTemplateBriefSchema.shape,
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
  ...TeamTemplateBriefSchema.shape,
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
