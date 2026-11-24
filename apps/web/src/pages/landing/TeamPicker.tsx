import { Link } from "react-router-dom";

export type TeamBot = {
  kind: string;
  name: string;
  job: string;
  steps: string;
};

export type Team = {
  id: string;
  label: string;
  handoff: string;
  bots: TeamBot[];
};

export const TEAMS: Team[] = [
  {
    id: "admin",
    label: "Admin and inbox",
    handoff: "inbox|drafts the reply|calendar|finds the time",
    bots: [
      { kind: "inbox", name: "Inbox triage", job: "Sorts your email and drafts replies in your tone.", steps: "Reading 12 new emails|3 replies ready for your yes|Sent after your yes" },
      { kind: "calendar", name: "Calendar keeper", job: "Finds times, books calls and sends reminders.", steps: "Checking your week|Thursday slot ready for your yes|Invite sent" },
      { kind: "meeting", name: "Meeting notes", job: "Turns your calls into notes and next steps.", steps: "Going over your last call|Notes ready for your yes|Shared with your team" },
      { kind: "books", name: "Receipt sorter", job: "Files your receipts and reminds you on the 5th.", steps: "Sorting 8 receipts|Folder ready for your yes|Filed for this month" },
    ],
  },
  {
    id: "sales",
    label: "Sales and leads",
    handoff: "followup|warms up the lead|proposal|writes the proposal",
    bots: [
      { kind: "followup", name: "Lead follow-up", job: "Keeps every lead warm with friendly follow ups.", steps: "Checking quiet leads|4 follow ups ready for your yes|Queued for tomorrow" },
      { kind: "proposal", name: "Proposal drafter", job: "Turns a quick brief into a proposal ready to send.", steps: "Reading your brief|Proposal ready for your yes|Proposal sent" },
      { kind: "calendar", name: "Calendar keeper", job: "Finds times, books calls and sends reminders.", steps: "Checking your week|Thursday slot ready for your yes|Invite sent" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing and content",
    handoff: "content|plans the post|social|lines it up",
    bots: [
      { kind: "content", name: "Content calendar", job: "Plans your posts and gets them ready to review.", steps: "Drafting next week's posts|2 posts ready for your yes|Scheduled for Monday" },
      { kind: "social", name: "Social scheduler", job: "Lines up your posts across your social accounts.", steps: "Lining up next week|4 posts ready for your yes|Posts scheduled" },
      { kind: "research", name: "Topic watch", job: "Watches your market and sums up what changed.", steps: "Reading this week's news|3 notes ready for Monday|Saved to your notes" },
      { kind: "review", name: "Review responder", job: "Thanks happy customers and drafts careful replies to the rest.", steps: "Reading new reviews|3 replies ready for your yes|Replies posted" },
    ],
  },
  {
    id: "finance",
    label: "Finance and books",
    handoff: "books|files the receipt|bookkeeping|updates the books",
    bots: [
      { kind: "books", name: "Receipt sorter", job: "Files your receipts and reminds you on the 5th.", steps: "Sorting 8 receipts|Folder ready for your yes|Filed for this month" },
      { kind: "bookkeeping", name: "Bookkeeping helper", job: "Sorts transactions and keeps your books tidy.", steps: "Sorting 24 transactions|3 to check with you|Books up to date" },
      { kind: "invoice", name: "Invoice chaser", job: "Sends polite reminders when invoices go unpaid.", steps: "Checking unpaid invoices|2 reminders ready for your yes|Reminders sent" },
    ],
  },
  {
    id: "support",
    label: "Customer support",
    handoff: "support|drafts the answer|review|asks for a review",
    bots: [
      { kind: "support", name: "Support replies", job: "Drafts answers to customer questions in your voice.", steps: "Reading 5 new questions|5 answers ready for your yes|Answers sent" },
      { kind: "review", name: "Review responder", job: "Thanks happy customers and drafts careful replies to the rest.", steps: "Reading new reviews|3 replies ready for your yes|Replies posted" },
      { kind: "inbox", name: "Inbox triage", job: "Sorts your email and drafts replies in your tone.", steps: "Reading 12 new emails|3 replies ready for your yes|Sent after your yes" },
    ],
  },
  {
    id: "research",
    label: "Research and planning",
    handoff: "research|spots a change|meeting|adds it to your notes",
    bots: [
      { kind: "research", name: "Topic watch", job: "Watches your market and sums up what changed.", steps: "Reading this week's news|3 notes ready for Monday|Saved to your notes" },
      { kind: "meeting", name: "Meeting notes", job: "Turns your calls into notes and next steps.", steps: "Going over your last call|Notes ready for your yes|Shared with your team" },
      { kind: "proposal", name: "Proposal drafter", job: "Turns a quick brief into a proposal ready to send.", steps: "Reading your brief|Proposal ready for your yes|Proposal sent" },
    ],
  },
];

export const ALL_BOT_NAMES = [
  "Inbox triage",
  "Calendar keeper",
  "Content calendar",
  "Lead follow-up",
  "Topic watch",
  "Receipt sorter",
  "Invoice chaser",
  "Support replies",
  "Social scheduler",
  "Review responder",
  "Meeting notes",
  "Bookkeeping helper",
  "Proposal drafter",
] as const;

function BuildCard() {
  return (
    <Link className="tb-card tb-build" to="/sign-up">
      <span className="tb-plus" aria-hidden="true">
        +
      </span>
      <h3>Add bots or build your own team</h3>
      <p>Mix any bots you like. Add one more when the work grows.</p>
    </Link>
  );
}

function BotCard({ bot }: { bot: TeamBot }) {
  return (
    <article className="tb-card" data-team-card="" data-steps={bot.steps}>
      <span data-wea-bot={bot.kind} data-size="88" data-label={bot.name} />
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
          aria-label="Example: 3 teams and 11 bots working at once"
        >
          <span className="tp-stack" aria-hidden="true">
            <span data-wea-bot="inbox" data-size="32" data-badge="false" />
            <span data-wea-bot="followup" data-size="32" data-badge="false" />
            <span data-wea-bot="content" data-size="32" data-badge="false" />
          </span>
          <span className="tp-live-dot" aria-hidden="true" />
          <span>
            <b data-count="3">3</b> teams, <b data-count="11">11</b> bots working right now
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
            <span data-wea-bot="inbox" data-size="64" data-badge="false" />
            <b>Inbox triage</b>
            <small>drafts the reply</small>
          </div>
          <div className="tb-track" aria-hidden="true">
            <span className="tb-mover">
              <i className="tb-token" />
            </span>
          </div>
          <div className="tb-node">
            <span data-wea-bot="calendar" data-size="64" data-badge="false" />
            <b>Calendar keeper</b>
            <small>finds the time</small>
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
