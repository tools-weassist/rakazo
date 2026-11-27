import type { SignupSurvey } from "@rakazo/contracts";
import { findBotTemplate } from "./bot-templates.js";
import { TEAM_TEMPLATES } from "./team-templates.js";

/** One ready-made bot or team to start with. */
export type StarterPick = { kind: "bot" | "team"; id: string };

const bot = (id: string): StarterPick => ({ kind: "bot", id });
const team = (id: string): StarterPick => ({ kind: "team", id });

/** A business owner who works alone starts from what they want help with first. */
const SOLO_OWNER_PICKS: Record<string, StarterPick> = {
  email: team("inbox-calendar-team"),
  delegate: bot("delegation-coach"),
  sops: bot("sop-builder"),
  marketing: bot("content-calendar-planner"),
  money: bot("ar-follow-up"),
  reports: bot("weekly-ops-report"),
};

/**
 * Wea's starter pick from the onboarding answers: who the person is, whether they already have an
 * AI brain, and what they want help with first. Null without a role, so skipping keeps today's
 * flow. Only existing templates; Inbox and admin triage stands in for the near-duplicate Inbox triage.
 */
export function recommendStarter(
  survey: Pick<SignupSurvey, "role" | "roleDetail" | "brain" | "needs">,
): StarterPick | null {
  const hasBrain = Boolean(survey.brain) && survey.brain !== "none" && survey.brain !== "unsure";
  const needs = survey.needs ?? [];
  switch (survey.role) {
    case "business_owner":
      if (survey.roleDetail === "has_va")
        return hasBrain ? team("client-va-pair") : team("client-delegation-team");
      if (survey.roleDetail === "hiring")
        return hasBrain ? bot("sop-builder") : bot("ai-brain-keeper");
      return SOLO_OWNER_PICKS[needs[0] ?? ""] ?? bot("morning-briefing");
    case "va":
      if (survey.roleDetail === "seeking")
        return needs.includes("ai_skills") ? bot("ai-upskill-coach") : team("va-business-team");
      if (survey.roleDetail === "many_clients")
        return hasBrain ? team("night-shift-team") : team("va-back-office");
      if (needs.includes("handoffs")) return team("night-shift-team");
      return hasBrain ? bot("results-eod-report") : bot("ai-brain-keeper");
    case "agency":
      return team("va-agency-team");
    case "exploring":
      return bot("morning-briefing");
    default:
      return null;
  }
}

/** The pick's template name, summary and version, or undefined for an id no template has. */
export function starterTemplate(
  pick: StarterPick,
): { name: string; summary: string; version: number; size: number } | undefined {
  if (pick.kind === "bot") {
    const found = findBotTemplate(pick.id);
    return found && { name: found.name, summary: found.summary, version: found.version, size: 1 };
  }
  const found = TEAM_TEMPLATES.find((entry) => entry.id === pick.id);
  return (
    found && {
      name: found.name,
      summary: found.summary,
      version: found.version,
      size: found.members.length,
    }
  );
}
