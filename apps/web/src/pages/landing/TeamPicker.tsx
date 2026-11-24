import { Link } from "react-router-dom";

export type TeamBot = {
  kind: string;
  name: string;
  job: string;
  steps: string;
  lead?: boolean;
};

export type Team = {
  id: string;
  label: string;
  handoff: string;
  bots: TeamBot[];
};

const LEAD_STEPS = "Checking in with the team|Summary ready for your yes|Shared with you";
const STEPS = "Working on it|Draft ready for your yes|Done after your yes";

export const TEAMS: Team[] = [
  {
    id: "inbox-calendar-team",
    label: "Inbox and calendar team",
    handoff: "morning-briefing|hands out the tasks|inbox-admin-triage|drafts the client reply",
    bots: [
      {
        kind: "morning-briefing",
        name: "Morning briefing",
        job: "Your day at a glance, every weekday morning.",
        steps: LEAD_STEPS,
        lead: true,
      },
      {
        kind: "inbox-admin-triage",
        name: "Inbox and admin triage",
        job: "Sorts email, drafts replies, tidies the calendar.",
        steps: STEPS,
      },
      {
        kind: "calendar-keeper",
        name: "Calendar keeper",
        job: "Plans the day, protects focus time and drafts every scheduling reply.",
        steps: STEPS,
      },
      {
        kind: "meeting-action-items",
        name: "Meeting notes and actions",
        job: "Turns meetings into notes, owners and follow ups.",
        steps: STEPS,
      },
    ],
  },
  {
    id: "marketing-team",
    label: "Marketing team",
    handoff:
      "content-calendar-planner|hands out the work|social-post-repurposer|turns it into posts",
    bots: [
      {
        kind: "content-calendar-planner",
        name: "Content calendar",
        job: "Plans a month of posts and keeps the week on track.",
        steps: LEAD_STEPS,
        lead: true,
      },
      {
        kind: "social-post-repurposer",
        name: "Social post repurposer",
        job: "Turns one blog, video or newsletter into a week of posts.",
        steps: STEPS,
      },
      {
        kind: "newsletter-drafter",
        name: "Newsletter drafter",
        job: "Drafts your monthly email newsletter from what happened.",
        steps: STEPS,
      },
      {
        kind: "lead-follow-up",
        name: "Lead follow-up",
        job: "Spots new inquiries fast and drafts the follow ups.",
        steps: STEPS,
      },
      {
        kind: "campaign-recap",
        name: "Campaign recap",
        job: "A plain English weekly recap of what your marketing did.",
        steps: STEPS,
      },
    ],
  },
  {
    id: "finance-team",
    label: "Finance team",
    handoff: "month-end-close|asks for the receipts|receipt-categorizer|sorts them and flags gaps",
    bots: [
      {
        kind: "month-end-close",
        name: "Month-end close",
        job: "Runs your month end checklist and chases what's missing.",
        steps: LEAD_STEPS,
        lead: true,
      },
      {
        kind: "receipt-categorizer",
        name: "Receipt sorter",
        job: "Finds receipts, sorts expenses and flags what's missing.",
        steps: STEPS,
      },
      {
        kind: "expense-report-prep",
        name: "Expense report prep",
        job: "Turns receipts into a ready to approve expense report.",
        steps: STEPS,
      },
      {
        kind: "ar-follow-up",
        name: "Invoice follow-up",
        job: "Tracks who owes you and drafts polite reminders.",
        steps: STEPS,
      },
      {
        kind: "cash-flow-snapshot",
        name: "Cash-flow snapshot",
        job: "A weekly look at cash in, cash out and what's coming.",
        steps: STEPS,
      },
    ],
  },
  {
    id: "operations-team",
    label: "Operations team",
    handoff: "weekly-ops-report|chases the numbers|project-status-updates|flags blockers early",
    bots: [
      {
        kind: "weekly-ops-report",
        name: "Weekly ops report",
        job: "Your business's week in one page: numbers, wins, problems.",
        steps: LEAD_STEPS,
        lead: true,
      },
      {
        kind: "meeting-action-items",
        name: "Meeting notes and actions",
        job: "Turns meetings into notes, owners and follow ups.",
        steps: STEPS,
      },
      {
        kind: "project-status-updates",
        name: "Project status updates",
        job: "Weekly project updates and early warnings on blockers.",
        steps: STEPS,
      },
      {
        kind: "sop-process-tracker",
        name: "Process tracker",
        job: "Keeps your SOP library complete, owned and up to date.",
        steps: STEPS,
      },
      {
        kind: "vendor-tracker",
        name: "Vendor tracker",
        job: "Tracks vendors, contracts and renewals before they bite.",
        steps: STEPS,
      },
    ],
  },
  {
    id: "client-delegation-team",
    label: "Client delegation team",
    handoff: "delegation-coach|turns an ask into a brief|sop-builder|writes the SOP",
    bots: [
      {
        kind: "delegation-coach",
        name: "Delegation coach",
        job: "Turns quick asks into clear briefs for your VA.",
        steps: LEAD_STEPS,
        lead: true,
      },
      {
        kind: "sop-builder",
        name: "SOP builder",
        job: "Turns how you work into SOPs your VA can follow.",
        steps: STEPS,
      },
      {
        kind: "va-onboarding-kit",
        name: "VA onboarding kit",
        job: "Runs a new VA's first two weeks, day by day.",
        steps: STEPS,
      },
      {
        kind: "sop-process-tracker",
        name: "Process tracker",
        job: "Keeps your SOP library complete, owned and up to date.",
        steps: STEPS,
      },
      {
        kind: "ai-brain-keeper",
        name: "AI brain keeper",
        job: "Builds and maintains the shared brain for a client and their VAs.",
        steps: STEPS,
      },
    ],
  },
  {
    id: "va-business-team",
    label: "VA business team",
    handoff: "va-business-manager|picks the week\u2019s moves|va-client-finder|drafts the pitch",
    bots: [
      {
        kind: "va-business-manager",
        name: "VA business manager",
        job: "Runs your VA business like a business: income, clients, hours and next moves.",
        steps: LEAD_STEPS,
        lead: true,
      },
      {
        kind: "va-client-finder",
        name: "VA client finder",
        job: "Finds good fit job posts and drafts your pitch.",
        steps: STEPS,
      },
      {
        kind: "scope-rate-guard",
        name: "Scope and rate guard",
        job: "Spots work beyond your deal and drafts a rate talk.",
        steps: STEPS,
      },
      {
        kind: "get-paid-back-office",
        name: "Get paid back office",
        job: "Invoices, payment reminders and hours per client.",
        steps: STEPS,
      },
      {
        kind: "ai-upskill-coach",
        name: "AI upskill coach",
        job: "Weekly AI lessons so you sell you plus your bots.",
        steps: STEPS,
      },
    ],
  },
];

export const ALL_BOT_NAMES = Array.from(
  new Set(TEAMS.flatMap((team) => team.bots.map((bot) => bot.name))),
);

function BuildCard() {
  return (
    <Link className="tb-card tb-build" to="/sign-up">
      <span className="tb-plus" aria-hidden="true">
        +
      </span>
      <h3>Add bots or build your own team</h3>
      <p>
        Start from 34 bots and 10 ready teams. Build your own on web or desktop, and add one more
        when the work grows.
      </p>
    </Link>
  );
}

function BotCard({ bot }: { bot: TeamBot }) {
  return (
    <article className="tb-card" data-team-card="" data-steps={bot.steps}>
      <span data-wea-bot={bot.kind} data-size="88" data-label={bot.name} />
      {bot.lead ? <span className="tb-lead">Team lead</span> : null}
      <h3>{bot.name}</h3>
      <p>{bot.job}</p>
      <span className="tb-chip" aria-live="off">
        <i />
        <span />
      </span>
    </article>
  );
}

export function TeamPicker() {
  const first = TEAMS[0];
  if (!first) return null;
  const [leftKind, leftCaption, rightKind, rightCaption] = first.handoff.split("|");
  const left = first.bots.find((bot) => bot.kind === leftKind);
  const right = first.bots.find((bot) => bot.kind === rightKind);

  return (
    <section className="tb" id="bots">
      <div className="wea-wrap">
        <div className="wea-center" data-reveal="">
          <h2>Hire the team your work needs</h2>
          <p className="wea-lead">
            Pick a ready team or mix your own bots. Run as many teams as you need, and every bot
            waits for your yes before anything goes out.
          </p>
        </div>
        <div
          className="tp-live"
          data-team-count=""
          data-reveal=""
          aria-label="Example: 3 teams and 14 bots working at once"
        >
          <span className="tp-stack" aria-hidden="true">
            <span data-wea-bot="morning-briefing" data-size="32" />
            <span data-wea-bot="content-calendar-planner" data-size="32" />
            <span data-wea-bot="month-end-close" data-size="32" />
          </span>
          <span className="tp-live-dot" aria-hidden="true" />
          <span>
            <b data-count="3">3</b> teams, <b data-count="14">14</b> bots working right now
          </span>
        </div>
        <div className="tp" data-team-picker="">
          <div className="tp-tabs" role="tablist" aria-label="Team types" data-reveal="">
            {TEAMS.map((team, index) => (
              <button
                className="tp-tab"
                role="tab"
                type="button"
                id={`tp-tab-${team.id}`}
                aria-controls={`tp-${team.id}`}
                aria-selected={index === 0}
                tabIndex={index === 0 ? 0 : -1}
                data-team={team.id}
                key={team.id}
              >
                {team.label}
              </button>
            ))}
          </div>
          {TEAMS.map((team, index) => (
            <div
              className="tp-panel"
              role="tabpanel"
              id={`tp-${team.id}`}
              aria-labelledby={`tp-tab-${team.id}`}
              data-team-panel={team.id}
              data-handoff={team.handoff}
              hidden={index !== 0}
              key={team.id}
            >
              <div className="tb-grid" style={{ ["--n" as string]: team.bots.length + 1 }}>
                {team.bots.map((bot) => (
                  <BotCard bot={bot} key={`${team.id}-${bot.kind}`} />
                ))}
                <BuildCard />
              </div>
            </div>
          ))}
        </div>
        <div
          className="tb-lane"
          data-team-lane=""
          data-reveal=""
          aria-label="Inside each team, bots hand work to each other. Nothing goes out until you say yes. Run several teams at once."
        >
          <div className="tb-node">
            <span data-wea-bot={leftKind} data-size="64" />
            <b>{left?.name}</b>
            <small>{leftCaption}</small>
          </div>
          <div className="tb-track" aria-hidden="true">
            <span className="tb-mover">
              <i className="tb-token" />
            </span>
          </div>
          <div className="tb-node">
            <span data-wea-bot={rightKind} data-size="64" />
            <b>{right?.name}</b>
            <small>{rightCaption}</small>
          </div>
          <div className="tb-track" aria-hidden="true">
            <span className="tb-mover">
              <i className="tb-token" />
            </span>
          </div>
          <div className="tb-yes">
            <span className="tb-btn">Yes, send it</span>
            <small>Nothing goes out until you say yes</small>
          </div>
          <div className="tb-add">
            <span className="tb-plus" aria-hidden="true">
              +
            </span>
            <b>Run several teams</b>
            <small>each with its own bots</small>
          </div>
        </div>
      </div>
    </section>
  );
}
