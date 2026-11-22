import { useLingui } from "@lingui/react/macro";
import type { TeamTemplateListing } from "@rakazo/contracts";

export type TeamTemplateCopy = Pick<TeamTemplateListing, "name" | "summary" | "sample"> & {
  roles: Record<string, string>;
};

/**
 * Each team's name, summary, sample and member roles in the app's language. The English here
 * must match `TEAM_TEMPLATES` (a test checks); a team without copy here shows the server's.
 */
export function useTeamTemplateCopy(): (team: TeamTemplateListing) => TeamTemplateCopy {
  const { t } = useLingui();
  return (team): TeamTemplateCopy => {
    switch (team.id) {
      case "finance-team":
        return {
          name: t`Finance team`,
          summary: t`Four finance bots that close the books together`,
          sample: t`**Finance team, Dec 1**

**Month-end close (lead):** November close started, 9 of 14 steps open.
- Asked **Receipt sorter** for missing receipts: 3 found, 2 still missing
- Asked **Invoice follow-up** for unpaid invoices: $8,450 owed, 2 reminders drafted
- Asked **Cash-flow snapshot** for the lowest point: about $9,800 on Dec 15

**Needs you:** approve the 2 reminders and send Mark's receipts.`,
          roles: {
            "month-end-close": t`Leads the team: runs the month-end checklist, asks the others for their part, and reports to you.`,
            "receipt-categorizer": t`Finds and sorts receipts and expenses, and flags what's missing.`,
            "ar-follow-up": t`Tracks unpaid customer invoices and drafts payment reminders.`,
            "cash-flow-snapshot": t`Shows cash today, what's coming in and out, and where it gets tight.`,
          },
        };
      case "marketing-team":
        return {
          name: t`Marketing team`,
          summary: t`Plan, write, repurpose and report on content as a team`,
          sample: t`**Marketing team, week of Nov 30**

**Content calendar (lead):** 4 posts and 1 newsletter planned this week.
- **Social post repurposer** turned Tuesday's blog into 5 posts
- **Newsletter drafter** has December's draft ready for your edits
- **Campaign recap**: the holiday email drove 14 bookings, so the plan adds a second send

**Needs you:** 3 photos from the Lopez job.`,
          roles: {
            "content-calendar-planner": t`Leads the team: plans the month's content, hands out the work, and keeps the week on track.`,
            "social-post-repurposer": t`Turns blogs, videos and newsletters into posts for each channel.`,
            "newsletter-drafter": t`Drafts the monthly email newsletter from what happened.`,
            "campaign-recap": t`Recaps what the marketing did each week and suggests what to try next.`,
          },
        };
      case "va-back-office":
        return {
          name: t`VA back office`,
          summary: t`A shared brain plus reports, meeting notes and project updates`,
          sample: t`**VA back office, Fri Nov 27**

**AI brain keeper (lead):** filed 9 new items in the team brain.
- **Meeting notes and actions** sent Tuesday's decisions to file
- **Project status updates**: the holiday catalog is at risk, blocker filed
- **Results EOD report** used both for today's client report

**Needs you:** Ana starts Monday. Share the brain folder with her?`,
          roles: {
            "ai-brain-keeper": t`Leads the team: keeps the shared brain current, and files what the others learn.`,
            "results-eod-report": t`Writes the daily and weekly client reports from the work actually done.`,
            "meeting-action-items": t`Turns meetings into notes, owners and follow-ups.`,
            "project-status-updates": t`Writes weekly project updates and flags blockers early.`,
          },
        };
      default:
        return {
          ...team,
          roles: Object.fromEntries(team.members.map((member) => [member.templateId, member.role])),
        };
    }
  };
}
