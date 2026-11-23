import type { SignupSurvey } from "@rakazo/contracts";

/** The heading of the shared-memory section the onboarding answers fill; rewritten on each answer. */
export const ABOUT_ME_HEADING = "## About me (from Wea sign-up)";

const ROLES: Record<string, string> = {
  business_owner: "Business owner",
  va: "Virtual assistant (VA)",
  agency: "Runs a VA agency or team",
  exploring: "Just exploring",
};
const ROLE_DETAILS: Record<string, string> = {
  has_va: "works with a VA today",
  hiring: "planning to hire a VA",
  solo: "works alone, no VA yet",
  one_client: "works for one client",
  many_clients: "works for several clients",
  seeking: "looking for clients",
  "1-5": "1-5 VAs on the team",
  "6-20": "6-20 VAs on the team",
  "20+": "more than 20 VAs on the team",
};
const BRAINS: Record<string, string> = {
  drive: "in Google Drive. Organize what is there; don't start over.",
  notion: "in Notion. Organize what is there; don't start over.",
  assistant: "in another AI assistant (ChatGPT, Claude, Grok Bot or similar); they can import it.",
  other: "in notes or files outside Wea (for example Obsidian). Organize it; don't start over.",
  none: "not set up yet.",
  unsure: "not set up yet (new to the idea).",
};
const NEEDS: Record<string, string> = {
  email: "email and calendar",
  delegate: "handing work to a VA",
  sops: "writing SOPs",
  marketing: "marketing and content",
  money: "invoices and money",
  reports: "weekly reports on the business",
  eod: "client reports (EOD)",
  client_inbox: "a client's inbox and calendar",
  handoffs: "handoffs across time zones",
  find_clients: "finding clients",
  get_paid: "getting paid and tracking hours",
  ai_skills: "learning AI skills",
  coverage: "client coverage and hours",
  onboarding_vas: "onboarding new VAs",
  client_reports: "client reports",
  billing: "billing",
  research: "research and writing",
  everything: "a bit of everything",
};

/** The lines every bot should know from the answers; empty when nothing useful was answered. */
export function aboutMeLines(survey: SignupSurvey): string[] {
  const lines: string[] = [];
  const role = survey.role && ROLES[survey.role];
  const detail = survey.roleDetail && ROLE_DETAILS[survey.roleDetail];
  if (role) lines.push(`- Role: ${role}${detail ? `, ${detail}` : ""}.`);
  if (survey.brain) lines.push(`- AI brain (their knowledge base): ${BRAINS[survey.brain]}`);
  const needs = (survey.needs ?? []).flatMap((need) => NEEDS[need] ?? []);
  if (needs.length) lines.push(`- Wants help first with: ${needs.join("; ")}.`);
  return lines;
}

/** `memory` with the About me section replaced by `lines`, or removed when there are none. */
export function withAboutMe(memory: string, lines: string[]): string {
  const start = memory.indexOf(ABOUT_ME_HEADING);
  let rest = memory;
  if (start >= 0) {
    const next = memory.indexOf("\n## ", start + ABOUT_ME_HEADING.length);
    rest = (memory.slice(0, start) + (next >= 0 ? memory.slice(next + 1) : "")).trimEnd();
  }
  if (!lines.length) return rest ? `${rest.trimEnd()}\n` : rest;
  const section = [ABOUT_ME_HEADING, "", ...lines].join("\n");
  return rest.trim() ? `${rest.trimEnd()}\n\n${section}\n` : `${section}\n`;
}
