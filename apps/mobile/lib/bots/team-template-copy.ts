import { t } from "@lingui/core/macro";
import type { TeamTemplateListing } from "@rakazo/contracts";

export type TeamTemplateCopy = Pick<
  TeamTemplateListing,
  "name" | "summary" | "sample" | "whatItDoes" | "howItHelps"
> & {
  roles: Record<string, string>;
};

/**
 * Each team's name, summary, sample, what-it-does, how-it-helps and member roles in the app's language. The English here
 * must match `TEAM_TEMPLATES` (a test checks); a team without copy here shows the server's.
 */
export function teamTemplateCopy(team: TeamTemplateListing): TeamTemplateCopy {
  const benefits: Record<string, Pick<TeamTemplateListing, "whatItDoes" | "howItHelps">> = {
    "va-back-office": {
      whatItDoes: [
        t`Runs a shared back office: a living brain, SOPs, meeting notes, project updates, and client reports`,
        t`The lead files what the other bots learn, so the team keeps one source of truth`,
        t`Turns calls and work into SOPs, actions, status updates, and the daily client report`,
        t`Asks you only for the approvals and decisions the team cannot take itself`,
        t`Follows a week-one plan so the team is useful in the first few days, not after a month`,
      ],
      howItHelps: [
        t`Your VA team shares one brain instead of five private note piles`,
        t`Client reports and project updates are drafted from real work, not from memory`,
        t`You spend time on approvals, not on assembling the pack yourself`,
        t`Nothing is sent or published until you say yes`,
      ],
    },
    "night-shift-team": {
      whatItDoes: [
        t`Keeps a Philippines-based VA and a US client in step while one of them sleeps`,
        t`Writes each handoff and shift briefing, with a question queue and defaults`,
        t`Sorts the inbox, protects the calendar, and turns daytime calls into overnight tasks`,
        t`Drafts the shift report the client reads in the morning`,
      ],
      howItHelps: [
        t`Work keeps moving overnight without a long, hand-written handoff`,
        t`The morning starts with a report and a clear list, not a pile of loose ends`,
        t`Questions have a default if no one answers before the deadline`,
        t`Nothing is sent, and no default is taken, outside the rules you set`,
      ],
    },
    "va-business-team": {
      whatItDoes: [
        t`Runs the VA's own back office: income, clients, rates, billing, and a weekly AI lesson`,
        t`Tracks income against your goal and flags when one client is too large a share`,
        t`Finds good-fit posts, drafts pitches, and spots work that's beyond the deal`,
        t`Drafts invoices and reminders, and suggests the week's three next moves`,
      ],
      howItHelps: [
        t`You can see the health of the VA business in one place each week`,
        t`New work, late payments, and scope creep are already drafted for you to act on`,
        t`You keep learning a useful AI skill without adding a second job`,
        t`Pitches, reminders, and rate talks only go out when you approve them`,
      ],
    },
    "client-delegation-team": {
      whatItDoes: [
        t`Helps a business owner hand work to a VA with clear briefs and real SOPs`,
        t`Turns a quick ask into a brief the VA can start, and files how you work as an SOP`,
        t`Keeps a shared priority list and a daily report of what was actually done`,
        t`The lead makes sure the briefs, SOPs, and reports stay in sync`,
      ],
      howItHelps: [
        t`Delegating stops depending on a long chat every time you have a new task`,
        t`The VA follows a brief and an SOP, so less work comes back wrong`,
        t`You still see a daily picture of progress without writing it yourself`,
        t`Briefs, SOPs, and reports only go to the VA or client after you approve them`,
      ],
    },
    "client-va-pair": {
      whatItDoes: [
        t`Gives a client and their VA one shared brain, SOP library, and priority list`,
        t`Files decisions and answers so both sides look in the same place`,
        t`Keeps daily reports and meeting follow-ups flowing both ways, across time zones`,
        t`Flags when the two sides have drifted onto different priorities`,
      ],
      howItHelps: [
        t`You and your VA work from the same plan, even in different time zones`,
        t`The same questions stop being asked twice`,
        t`Daily reports and follow-ups are drafted, so the partnership stays visible`,
        t`Priorities and notes only change when you confirm them`,
      ],
    },
    "finance-team": {
      whatItDoes: [
        t`Keeps receipts, invoices, cash, expense reports, and the month-end close in one rhythm`,
        t`Sorts receipts, chases missing ones, and drafts invoice reminders`,
        t`Builds the weekly cash snapshot and the expense reports you need to approve`,
        t`Runs the close checklist and prepares the close packet for your review`,
      ],
      howItHelps: [
        t`The books stay in motion during the month, not only in a last-week scramble`,
        t`You review lists and drafts instead of building them from scratch`,
        t`Cash surprises and missing receipts show up early`,
        t`No reminder is sent, and nothing is marked final, until you approve it`,
      ],
    },
    "marketing-team": {
      whatItDoes: [
        t`Plans the month, drafts the newsletter, and turns one piece into a week of posts`,
        t`Follows up new leads and writes the weekly recap of what the marketing did`,
        t`Keeps the calendar, the drafts, and the recap in one team so nothing is orphaned`,
        t`Asks you only to pick the plan, approve the copy, and send the follow-ups`,
      ],
      howItHelps: [
        t`Marketing has a weekly rhythm instead of a pile of half-finished drafts`,
        t`One piece of work fills the channels, and leads don't go cold`,
        t`You can see what the week achieved without opening every tool`,
        t`Nothing is posted or sent until you say yes`,
      ],
    },
    "operations-team": {
      whatItDoes: [
        t`Keeps SOPs, meeting notes, project updates, vendors, and the weekly ops report together`,
        t`Flags stale processes, open actions, blockers, and upcoming renewals`,
        t`Drafts the weekly ops picture so you can run the meeting from one page`,
        t`The lead keeps the rhythm and asks you only for the decisions that need you`,
      ],
      howItHelps: [
        t`Operations has a weekly beat, not a scatter of lists in different tools`,
        t`Renewals, blockers, and stale SOPs show up before they bite`,
        t`The Monday meeting starts from a draft, not from memory`,
        t`Reports and reminders only go out after you approve them`,
      ],
    },
    "inbox-calendar-team": {
      whatItDoes: [
        t`Gives you a morning briefing, a sorted inbox, a protected calendar, and drafted follow-ups`,
        t`Sorts email and drafts replies, and flags meetings that clash or need a decision`,
        t`Turns meetings into owners and due dates so follow-ups don't drop`,
        t`The lead puts the day in order so you see what needs you first`,
      ],
      howItHelps: [
        t`The morning starts with one picture of the day, not four overflowing apps`,
        t`Replies and scheduling notes are drafted, so you only decide and send`,
        t`Meeting actions don't vanish after the call`,
        t`No email is sent and no meeting is moved until you approve it`,
      ],
    },
    "va-agency-team": {
      whatItDoes: [
        t`Helps an agency owner run several VAs and clients: coverage, SOPs, reports, and billing`,
        t`Flags a client day with no backup, and tracks retainer hours against the work`,
        t`Keeps onboarding, SOPs, and client reports consistent across the roster`,
        t`Drafts invoices and the weekly ops picture so you can reassign work in time`,
      ],
      howItHelps: [
        t`You see a coverage or hours problem before the client does`,
        t`New VAs and client reports follow the same standard, not a one-off scramble`,
        t`Billing and the weekly picture are drafted, so you spend time deciding, not assembling`,
        t`No schedule, report, or invoice goes out until you approve it`,
      ],
    },
  };
  const extra = benefits[team.id] ?? {
    whatItDoes: team.whatItDoes,
    howItHelps: team.howItHelps,
  };
  const copy = (() => {
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
  })();
  return { ...copy, ...extra } as TeamTemplateCopy;
}
