import { BOT_TEMPLATE_CATEGORIES, BotTemplateSchema } from "@rakazo/contracts";
import { describe, expect, it } from "vitest";
import { looksLikeCredential } from "../agent-import/index.js";
import { matchFeaturedConnectorId } from "../integrations/featured-connectors.js";
import { presetFromCron } from "../routines/schedule.js";
import { extractRoutineSkillMentions } from "../skills/agent-skill.js";
import { BOT_TEMPLATES, findBotTemplate } from "./bot-templates.js";
import { FINANCE_BOT_TEMPLATES } from "./finance-bot-templates.js";
import { MARKETING_BOT_TEMPLATES } from "./marketing-bot-templates.js";
import { OPS_BOT_TEMPLATES } from "./ops-bot-templates.js";
import { VA_BOT_TEMPLATES } from "./va-bot-templates.js";

describe("bot templates", () => {
  it("each validates strictly and has a unique id", () => {
    for (const template of BOT_TEMPLATES) {
      expect(BotTemplateSchema.parse(template)).toEqual(template);
    }
    const ids = BOT_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findBotTemplate("morning-briefing")?.name).toBe("Morning briefing");
    expect(findBotTemplate("missing")).toBeUndefined();
  });

  it("list the templates for virtual assistants first", () => {
    expect(BOT_TEMPLATES.slice(0, VA_BOT_TEMPLATES.length)).toEqual(VA_BOT_TEMPLATES);
    expect(VA_BOT_TEMPLATES.map((template) => template.id)).toEqual([
      "ai-brain-keeper",
      "sop-builder",
      "results-eod-report",
      "va-client-finder",
      "delegation-coach",
      "ai-upskill-coach",
      "get-paid-back-office",
      "scope-rate-guard",
      "inbox-admin-triage",
      "night-shift-handoff",
      "va-onboarding-kit",
    ]);
  });

  it("each have a known category, and every category has templates", () => {
    for (const template of BOT_TEMPLATES) {
      expect(BOT_TEMPLATE_CATEGORIES, template.id).toContain(template.category);
    }
    for (const category of BOT_TEMPLATE_CATEGORIES) {
      expect(
        BOT_TEMPLATES.some((template) => template.category === category),
        category,
      ).toBe(true);
    }
  });

  it("are listed in category order, so each category's templates stay together", () => {
    const order = BOT_TEMPLATES.map((template) =>
      BOT_TEMPLATE_CATEGORIES.indexOf(template.category),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("file each group's templates under its own category", () => {
    const groups = [
      [VA_BOT_TEMPLATES, "virtual-assistants"],
      [FINANCE_BOT_TEMPLATES, "accounting-finance"],
      [MARKETING_BOT_TEMPLATES, "marketing"],
      [OPS_BOT_TEMPLATES, "operations"],
    ] as const;
    for (const [templates, category] of groups) {
      expect(templates.length).toBeGreaterThanOrEqual(5);
      for (const template of templates) expect(template.category, template.id).toBe(category);
    }
  });

  it("carry nothing shaped like a credential", () => {
    for (const template of BOT_TEMPLATES) {
      const texts = [
        template.sample,
        template.instructions,
        ...template.skills.flatMap((skill) => [skill.description, skill.body]),
        ...template.routines.map((routine) => routine.prompt),
      ];
      expect(texts.filter(looksLikeCredential)).toEqual([]);
    }
  });

  it("mention only their own skills, and every skill is used by a routine", () => {
    for (const template of BOT_TEMPLATES) {
      const names = template.skills.map((skill) => skill.name);
      const mentioned = template.routines.flatMap((routine) =>
        extractRoutineSkillMentions(routine.prompt),
      );
      expect(new Set(mentioned)).toEqual(new Set(names));
    }
  });

  it("use schedules the routine editor shows without Advanced", () => {
    for (const template of BOT_TEMPLATES) {
      for (const cron of template.routines.flatMap((routine) => routine.crons)) {
        expect(presetFromCron(cron).freq).not.toBe("Advanced");
      }
    }
  });

  it("name apps the connection catalog knows", () => {
    // Featured apps match by alias; the code host is matched by its own slug.
    for (const app of BOT_TEMPLATES.flatMap((template) => template.apps)) {
      expect(app === "github" || matchFeaturedConnectorId(app) !== null).toBe(true);
    }
  });
});
