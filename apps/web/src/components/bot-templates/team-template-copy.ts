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
      case "va-back-office":
        return {
          name: t`VA back office`,
          summary: t`A shared brain plus SOPs, client reports, meeting notes and project updates`,
          sample: t`**VA back office, Fri Nov 27**

**AI brain keeper (lead):** filed 9 new items in the team brain. 14 of 17 team questions this week were answered from it.
- **SOP builder** drafted the refund SOP from Tuesday's call
- **Meeting notes and actions** sent Tuesday's decisions to file
- **Project status updates**: the holiday catalog is at risk, blocker filed
- **Results EOD report** used all of it for today's client report

**Needs you:** approve the refund SOP. Ana starts Monday: share the brain folder with her?`,
          roles: {
            "ai-brain-keeper": t`Leads the team: keeps the shared brain current, and files what the others learn.`,
            "sop-builder": t`Turns how the owner works into SOPs the VAs can follow, and files them in the brain.`,
            "results-eod-report": t`Writes the daily and weekly client reports from the work actually done.`,
            "meeting-action-items": t`Turns meetings into notes, owners and follow-ups.`,
            "project-status-updates": t`Writes weekly project updates and flags blockers early.`,
          },
        };
      case "night-shift-team":
        return {
          name: t`Night-shift handoff team`,
          summary: t`Keeps a Philippines-based VA and a US client in step while one of them sleeps`,
          sample: t`**Night-shift team, Tue 8:00 AM EST** (9:00 PM PHT)

**Night-shift handoff (lead):** Jen's handoff was in her inbox at 7:40 AM EST. 2 of 2 queued questions answered.
- **Inbox and admin triage**: 22 emails sorted overnight, 6 replies drafted for Ana
- **Calendar keeper**: moved nothing, but flagged the 3:30 PM EST clash
- **Results EOD report**: Ana's shift report is ready for her yes
- **Meeting notes and actions**: Jen's 2:00 PM EST call left 3 tasks for tonight

**Needs you (Jen):** ship the Hendricks order without the missing part? Default at 5:00 PM EST: hold it.`,
          roles: {
            "night-shift-handoff": t`Leads the team: writes each handoff and shift briefing, and keeps the question queue with defaults.`,
            "inbox-admin-triage": t`Sorts the client's inbox during the VA's shift and drafts the replies.`,
            "calendar-keeper": t`Plans the client's next day and drafts scheduling replies, with times in both zones.`,
            "results-eod-report": t`Turns the shift's real work into the report the client reads in the morning.`,
            "meeting-action-items": t`Turns the client's daytime calls into tasks the VA can pick up overnight.`,
          },
        };
      case "va-business-team":
        return {
          name: t`VA business team`,
          summary: t`The VA's own back office: clients, rates and scope, getting paid, and AI skills`,
          sample: t`**Your VA business, week of Nov 23**

**VA business manager (lead):** $1,180 billed of your $1,400 goal. One client is 70% of income.
- **VA client finder**: 4 good-fit posts, 2 proposals drafted for you to send
- **Scope and rate guard**: Bright Smiles added social posting to your role. Rate talk drafted
- **Get paid back office**: Lopez Realty is 9 days late. Polite reminder drafted
- **AI upskill coach**: this week's 20-minute lesson is inbox automations

**Needs you:** approve the reminder and pick which proposal goes first.`,
          roles: {
            "va-business-manager": t`Leads the team: tracks income against goal, client risk and hours, and picks the week's 3 moves.`,
            "va-client-finder": t`Finds good-fit job posts and drafts proposals, so no one client is too big a share of income.`,
            "scope-rate-guard": t`Spots work beyond each deal and drafts the scope or rate conversation.`,
            "get-paid-back-office": t`Drafts invoices and payment reminders, and tracks hours per client.`,
            "ai-upskill-coach": t`Teaches one practical AI skill a week, so the VA sells their skills plus their bots.`,
          },
        };
      case "client-delegation-team":
        return {
          name: t`Client delegation team`,
          summary: t`Helps a business owner hand work to a VA with clear briefs and real SOPs`,
          sample: t`**Delegation team, week of Nov 23**

**Delegation coach (lead):** 6 hours a week of your tasks now sit with Ana, up from 2.
- **SOP builder** turned your Loom on refunds into an SOP with 2 questions left
- **VA onboarding kit**: Ana is on day 4 of 10; tomorrow she shadows the claims process
- **Process tracker**: 3 of your top 10 tasks still have no SOP
- **AI brain keeper** filed both SOPs where Ana looks first

**Needs you:** answer the 2 refund questions, and pick next week's task to hand over.`,
          roles: {
            "delegation-coach": t`Leads the team: finds what to hand off next, turns quick asks into clear briefs, and tracks hours moved.`,
            "sop-builder": t`Interviews the owner and turns each task into an SOP the VA can follow.`,
            "va-onboarding-kit": t`Runs a new VA's first two weeks, day by day.`,
            "sop-process-tracker": t`Keeps the SOP list complete, owned and reviewed, and shows what's still in the owner's head.`,
            "ai-brain-keeper": t`Files every SOP and brief in the shared brain so the VA finds it without asking.`,
          },
        };
      case "client-va-pair":
        return {
          name: t`Client and VA pair team`,
          summary: t`One shared brain, SOPs and priority list for a client and their VA`,
          sample: t`**Bright Smiles pair: Jen and Ana, week of Nov 23**

**Client and VA sync (lead):** 4 of 5 priorities done on time last week. The promo emails slipped a day.
- **AI brain keeper**: 3 decisions filed, so Ana stopped asking about late cancellations
- **SOP builder**: the claims SOP now has the new form
- **Night-shift handoff**: every queued question was answered or defaulted
- **Results EOD report**: Friday's weekly roll-up is ready for Jen

**Needs you:** Jen, confirm this week's 5 priorities. Ana, add your feedback item for Monday's sync.`,
          roles: {
            "client-va-sync": t`Leads the team: keeps one shared priority list, runs the weekly sync, and captures decisions.`,
            "ai-brain-keeper": t`Keeps the one brain both sides use: SOPs, decisions, preferences and FAQs.`,
            "sop-builder": t`Turns the client's way of working into SOPs both sides agree on.`,
            "night-shift-handoff": t`Writes the handoffs and question queue across the time gap.`,
            "results-eod-report": t`Reports the VA's real results against the shared priorities.`,
          },
        };
      case "finance-team":
        return {
          name: t`Finance team`,
          summary: t`Five finance bots that keep receipts, invoices and cash in order and close the books`,
          sample: t`**Finance team, Dec 1**

**Month-end close (lead):** November close started, 9 of 14 steps open. Target: closed by Dec 5.
- Asked **Receipt sorter** for missing receipts: 3 found, 2 still missing
- **Expense report prep** has Mark's report ready, waiting on his 2 receipts
- Asked **Invoice follow-up** for unpaid invoices: $8,450 owed, 2 reminders drafted
- Asked **Cash-flow snapshot** for the lowest point: about $9,800 on Dec 15

**Needs you:** approve the 2 reminders and send Mark's receipts.`,
          roles: {
            "month-end-close": t`Leads the team: runs the month-end checklist, asks the others for their part, and reports to you.`,
            "receipt-categorizer": t`Finds and sorts receipts and expenses, and flags what's missing.`,
            "expense-report-prep": t`Builds expense reports from the sorted receipts for each person.`,
            "ar-follow-up": t`Tracks unpaid customer invoices and drafts payment reminders.`,
            "cash-flow-snapshot": t`Shows cash today, what's coming in and out, and where it gets tight.`,
          },
        };
      case "marketing-team":
        return {
          name: t`Marketing team`,
          summary: t`Plan, write, repurpose, follow up and report on marketing as a team`,
          sample: t`**Marketing team, week of Nov 30**

**Content calendar (lead):** 4 posts and 1 newsletter planned this week. Last week: 5 of 6 shipped on time.
- **Social post repurposer** turned Tuesday's blog into 5 posts
- **Newsletter drafter** has December's draft ready for your edits
- **Lead follow-up** drafted replies to 3 new inquiries from the holiday post
- **Campaign recap**: the holiday email drove 14 bookings, so the plan adds a second send

**Needs you:** 3 photos from the Lopez job, and a yes on the 3 replies.`,
          roles: {
            "content-calendar-planner": t`Leads the team: plans the month's content, hands out the work, and keeps the week on track.`,
            "social-post-repurposer": t`Turns blogs, videos and newsletters into posts for each channel.`,
            "newsletter-drafter": t`Drafts the monthly email newsletter from what happened.`,
            "lead-follow-up": t`Drafts quick, personal replies to the inquiries the content brings in.`,
            "campaign-recap": t`Recaps what the marketing did each week and suggests what to try next.`,
          },
        };
      case "operations-team":
        return {
          name: t`Operations team`,
          summary: t`SOPs, meetings, projects and vendors in one weekly operations rhythm`,
          sample: t`**Operations team, week of Nov 23**

**Weekly ops report (lead):** 18 of 21 action items closed on time (86%). Revenue on plan, 2 problems open.
- **Meeting notes and actions**: 3 calls, 9 action items, 2 overdue
- **Project status updates**: the website refresh is at risk, waiting on copy
- **Process tracker**: the returns SOP is 7 months old and the process changed
- **Vendor tracker**: the phone plan renews Dec 15 at a higher price

**Needs you:** pick an owner for the website copy, and say whether to shop the phone plan.`,
          roles: {
            "weekly-ops-report": t`Leads the team: writes the one-page weekly ops report and chases the others for their numbers.`,
            "meeting-action-items": t`Turns meetings into notes, owners, due dates and follow-ups.`,
            "project-status-updates": t`Writes weekly project updates and flags blockers early.`,
            "sop-process-tracker": t`Keeps the SOP library complete, owned and up to date.`,
            "vendor-tracker": t`Tracks vendors, contracts and renewals before they bite.`,
          },
        };
      case "inbox-calendar-team":
        return {
          name: t`Inbox and calendar team`,
          summary: t`A morning briefing, a sorted inbox, a protected calendar and no dropped follow-ups`,
          sample: t`**Inbox and calendar team, Tue Nov 24**

**Morning briefing (lead):** 3 meetings, 1 focus block, 6 emails that need you. Yesterday: 19 of 20 replies drafted within a day.
- **Inbox and admin triage**: 41 new emails sorted, 6 replies drafted, 12 archived
- **Calendar keeper**: the 3:30 PM clash is fixed in a draft; 2 scheduling replies ready
- **Meeting notes and actions**: yesterday's call left 4 follow-ups, 1 is yours

**Needs you:** a yes on the 6 replies and the meeting move.`,
          roles: {
            "morning-briefing": t`Leads the team: one morning briefing from the inbox, calendar and follow-ups, and what needs you first.`,
            "inbox-admin-triage": t`Sorts the inbox, drafts replies and keeps the admin moving.`,
            "calendar-keeper": t`Plans each day, protects focus time and drafts every scheduling reply.`,
            "meeting-action-items": t`Turns meetings into follow-ups, so nothing promised is forgotten.`,
          },
        };
      case "va-agency-team":
        return {
          name: t`VA agency team`,
          summary: t`For agency owners running several VAs and clients: coverage, SOPs, reports and billing`,
          sample: t`**Agency team, Mon Nov 23**: 9 clients, 7 VAs

**VA agency ops (lead):** 97% of client workdays covered last week. Ana is off Thu and Fri with no backup yet.
- **VA onboarding kit**: Carla's day-by-day plan for Bright Smiles is ready
- **SOP builder**: Bright Smiles' SOPs are complete enough for a backup
- **Results EOD report**: 9 client reports drafted from the VAs' real work
- **Scope and rate guard**: Lopez Realty asked for bookkeeping, outside its package
- **Get paid back office**: 2 retainer invoices go out Dec 1

**Needs you:** assign Carla as backup, and approve the Lopez scope note.`,
          roles: {
            "agency-ops-manager": t`Leads the team: tracks clients, VAs, coverage, retainer hours and client health.`,
            "va-onboarding-kit": t`Onboards each new VA or backup onto a client, day by day.`,
            "sop-builder": t`Keeps per-client SOPs a backup VA can follow on day one.`,
            "results-eod-report": t`Drafts each client's report from their VA's real work.`,
            "scope-rate-guard": t`Spots client requests outside the package and drafts the scope note.`,
            "get-paid-back-office": t`Drafts retainer invoices and payment reminders, and tracks hours per client.`,
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
