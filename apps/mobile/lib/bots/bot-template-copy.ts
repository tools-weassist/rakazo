import { t } from "@lingui/core/macro";
import type { BotTemplate, BotTemplateCategory } from "@rakazo/contracts";

export type BotTemplateCopy = Pick<
  BotTemplate,
  "name" | "summary" | "sample" | "whatItDoes" | "howItHelps"
>;

/**
 * Each template's name, summary, sample, what-it-does and how-it-helps in the app's language. The English here must match
 * `BOT_TEMPLATES` (a test checks); a template without copy here shows the server's English.
 */
const benefits: Record<string, Pick<BotTemplate, "whatItDoes" | "howItHelps">> = {
  "ai-brain-keeper": {
    whatItDoes: [
      t`Sets up a shared brain for you, your client, and their VAs, and keeps it current`,
      t`Files new decisions, FAQs, and answers as they come up in the work`,
      t`Runs a regular check and flags anything stale, missing, or unfiled`,
      t`Answers team questions from the brain first, and notes what it could not find`,
      t`Reminds you when a new person needs access to the brain`,
    ],
    howItHelps: [
      t`The team stops asking the same questions, because the answers live in one place`,
      t`New VAs can get up to speed from the brain instead of from you`,
      t`You see what is missing or out of date before it turns into a mistake`,
      t`Nothing is filed or shared until you say so`,
    ],
  },
  "sop-builder": {
    whatItDoes: [
      t`Turns how you already work into a step-by-step SOP your VA can follow`,
      t`Drafts the SOP from a call, a chat, or a rough note you already have`,
      t`Asks the few questions needed to fill gaps, then revises from your edits`,
      t`Keeps a library of current SOPs and flags ones that look out of date`,
    ],
    howItHelps: [
      t`You explain a task once, instead of walking someone through it every week`,
      t`A new VA can follow the same steps you would, without guessing`,
      t`SOPs stay current when the work changes, instead of sitting forgotten`,
      t`Every draft waits for your yes before anyone uses it`,
    ],
  },
  "results-eod-report": {
    whatItDoes: [
      t`Writes the daily or weekly client report from work that was actually done`,
      t`Pulls from the brain, tickets, messages, and notes, not from memory`,
      t`Flags blockers, open questions, and anything that needs your decision`,
      t`Drafts the report in the format your client already expects`,
    ],
    howItHelps: [
      t`You stop writing the end-of-day report from scratch after a long shift`,
      t`The client sees real progress, not a vague recap`,
      t`Nothing important from the day is left out because you were tired`,
      t`The report only goes out once you approve it`,
    ],
  },
  "va-client-finder": {
    whatItDoes: [
      t`Watches for job posts that fit the work and hours you actually want`,
      t`Filters out poor-fit roles so you only review the good ones`,
      t`Drafts a short, specific pitch for each post you might take`,
      t`Tracks which posts you already answered so you don't double-apply`,
    ],
    howItHelps: [
      t`You spend time on posts that are a real fit, not on scrolling`,
      t`Each pitch starts from a draft, not a blank page`,
      t`You can keep a pipeline going even on a busy client week`,
      t`Nothing is sent to a prospect until you say so`,
    ],
  },
  "delegation-coach": {
    whatItDoes: [
      t`Turns a quick ask into a clear brief your VA can start without guessing`,
      t`Adds the outcome, deadline, examples, and what done looks like`,
      t`Flags when a task is still too vague or is really several tasks`,
      t`Saves the briefs you like, so the next one matches your style`,
    ],
    howItHelps: [
      t`You stop rewriting the same instructions after the VA gets stuck`,
      t`Work comes back closer to what you meant the first time`,
      t`Delegating takes a few minutes instead of a long back-and-forth`,
      t`The brief only goes to your VA after you approve it`,
    ],
  },
  "ai-upskill-coach": {
    whatItDoes: [
      t`Gives you one short, practical AI lesson each week that fits VA work`,
      t`Shows a real task you can try with a bot, then review yourself`,
      t`Builds on last week's lesson so the skill actually sticks`,
      t`Suggests how you can sell the new skill, not just use it yourself`,
    ],
    howItHelps: [
      t`You get better at using AI without carving out a whole course`,
      t`You can charge for the skill, not only for the hours`,
      t`Each lesson is small enough to finish in a short break`,
      t`You decide what to try; nothing runs on a client's work until you say so`,
    ],
  },
  "get-paid-back-office": {
    whatItDoes: [
      t`Tracks hours, invoices, and what each client still owes`,
      t`Drafts invoices and polite payment reminders in your voice`,
      t`Flags late payments and clients who are close to their hours cap`,
      t`Gives you a simple picture of billed, paid, and outstanding`,
    ],
    howItHelps: [
      t`You spend less time chasing invoices and more time on paid work`,
      t`Late payments get a reminder before they get awkward`,
      t`You can see which clients are behind without opening five tools`,
      t`No invoice or reminder is sent until you approve it`,
    ],
  },
  "scope-rate-guard": {
    whatItDoes: [
      t`Compares the week's work to what you actually agreed to do`,
      t`Flags tasks that look like scope creep or unpaid extras`,
      t`Drafts a short, calm note to reset the scope or talk about the rate`,
      t`Keeps a running picture of hours versus the deal for each client`,
    ],
    howItHelps: [
      t`You catch extra work before it becomes an unpaid habit`,
      t`The rate or scope conversation starts from a draft, not from frustration`,
      t`You can see which clients are quietly taking more than they pay for`,
      t`Nothing goes to the client until you have signed off`,
    ],
  },
  "inbox-admin-triage": {
    whatItDoes: [
      t`Sorts new email into reply needed, for your information, and low priority`,
      t`Drafts replies in your voice for anything that needs an answer`,
      t`Tidies obvious calendar clashes and flags ones only you can decide`,
      t`Learns from your corrections so the next sort is closer to how you work`,
    ],
    howItHelps: [
      t`You only read what matters, instead of the whole inbox`,
      t`Replies are drafted and waiting, so catching up takes minutes`,
      t`Admin work gets handled in the background of a busy day`,
      t`No email is sent, deleted, or archived unless you ask`,
    ],
  },
  "night-shift-handoff": {
    whatItDoes: [
      t`Writes the end-of-shift handoff so the other side knows exactly where things stand`,
      t`Queues questions that need a decision, with a default if no one answers in time`,
      t`Briefs the next shift on what was done, what's blocked, and what's first`,
      t`Keeps both time zones on the same page, including deadlines and meetings`,
    ],
    howItHelps: [
      t`The US client and the PH VA stay in step even when one of them is asleep`,
      t`Questions don't sit all night with no default and no owner`,
      t`You stop writing the same handoff from scratch at the end of every shift`,
      t`Nothing goes out, and no default is taken, until you have set the rules`,
    ],
  },
  "va-onboarding-kit": {
    whatItDoes: [
      t`Runs a new VA's first two weeks as a day-by-day plan`,
      t`Shares the right SOPs, access, and context on the day they're needed`,
      t`Checks in on progress and flags anything the new VA is stuck on`,
      t`Drafts the welcome, the day's tasks, and the end-of-week check-in`,
    ],
    howItHelps: [
      t`A new VA ramps up without you inventing the first two weeks each time`,
      t`You see on day three if something is already off, not on day ten`,
      t`The client gets a consistent start instead of a scramble`,
      t`Each day's plan is a draft you can adjust before it goes to the VA`,
    ],
  },
  "va-business-manager": {
    whatItDoes: [
      t`Tracks income against your goal, hours, and how much each client is worth`,
      t`Spots client risk, like one client being too large a share of your income`,
      t`Picks a short list of the week's next moves, in priority order`,
      t`Pulls in what the other bots drafted so you can decide in one place`,
    ],
    howItHelps: [
      t`You run the VA business from one weekly picture, not from scattered notes`,
      t`You see a risky client or a short week early enough to do something`,
      t`The next three moves are already chosen, so you don't stall on planning`,
      t`You stay in charge of every decision; the bots only draft and recommend`,
    ],
  },
  "client-va-sync": {
    whatItDoes: [
      t`Keeps one shared priority list for a client and their VA, across time zones`,
      t`Turns new asks into clear tasks with an owner and a due time in both zones`,
      t`Flags when the client and the VA have drifted onto different priorities`,
      t`Drafts a short weekly sync so both sides see the same plan`,
    ],
    howItHelps: [
      t`You and your VA stop working from two different lists`,
      t`Time zones stop turning a same-day ask into a missed day`,
      t`The weekly sync is already drafted, so the meeting can be short or skipped`,
      t`Priorities only change when you confirm them`,
    ],
  },
  "calendar-keeper": {
    whatItDoes: [
      t`Plans tomorrow from what's already on the calendar and what's still open`,
      t`Protects focus time and flags clashes before they happen`,
      t`Drafts every scheduling reply, with times in both time zones when needed`,
      t`Moves nothing on its own; it only proposes a change`,
    ],
    howItHelps: [
      t`Your day is planned before you sit down, not rebuilt in the morning rush`,
      t`Focus time stays protected instead of being nibbled away`,
      t`Scheduling back-and-forth starts from a draft, not a blank reply`,
      t`No meeting is moved or booked until you approve it`,
    ],
  },
  "agency-ops-manager": {
    whatItDoes: [
      t`Gives you one view of clients, VAs, coverage, and retainer hours`,
      t`Flags a client day with no backup when a VA is off`,
      t`Tracks hours against retainers so a client isn't quietly over or under`,
      t`Drafts the weekly ops picture so you can reassign work in time`,
    ],
    howItHelps: [
      t`You see a coverage gap before the client does`,
      t`Retainer hours stay on track instead of surprising you at month-end`,
      t`Reassigning work starts from a clear picture, not from memory`,
      t`No schedule or client message changes until you approve it`,
    ],
  },
  "receipt-categorizer": {
    whatItDoes: [
      t`Finds new receipts and expense charges from the accounts you connect`,
      t`Sorts them into your categories and matches them to a vendor or trip`,
      t`Flags missing receipts, odd amounts, and things that don't look like expenses`,
      t`Prepares a clean list you can review before anything is booked`,
    ],
    howItHelps: [
      t`You stop hunting through inboxes and photo rolls for last month's receipts`,
      t`Missing receipts show up while you can still find them`,
      t`Categorizing takes a review, not a full afternoon of sorting`,
      t`Nothing is filed in the books until you approve the list`,
    ],
  },
  "ar-follow-up": {
    whatItDoes: [
      t`Tracks open invoices and how long each one has been unpaid`,
      t`Drafts a polite reminder in your voice, matched to how late it is`,
      t`Flags invoices that are slipping past your usual terms`,
      t`Keeps a simple list of who owes what, so you can see it at a glance`,
    ],
    howItHelps: [
      t`Late invoices get a reminder before they go cold`,
      t`You don't have to write the same chase email from scratch`,
      t`You can see outstanding cash without opening the ledger every day`,
      t`No reminder is sent until you have approved it`,
    ],
  },
  "month-end-close": {
    whatItDoes: [
      t`Runs your month-end checklist and shows what's done, missing, or blocked`,
      t`Chases the missing receipts, numbers, or reviews that are holding the close`,
      t`Drafts the close packet or summary in the format you already use`,
      t`Keeps a count of days to close so you can see if you're slipping`,
    ],
    howItHelps: [
      t`Month-end stops being a scramble through a half-remembered list`,
      t`You find out what's missing early, not on the last day`,
      t`The close packet starts from a draft, not a blank folder`,
      t`Nothing is marked final, and nothing is sent, until you say so`,
    ],
  },
  "expense-report-prep": {
    whatItDoes: [
      t`Gathers the receipts for a trip or a period into one report`,
      t`Checks dates, amounts, and missing items before you review it`,
      t`Formats the report the way your approver or client expects`,
      t`Flags anything that looks out of policy so you can decide`,
    ],
    howItHelps: [
      t`The report is ready to review instead of being built the night before it's due`,
      t`Missing receipts are caught before you submit`,
      t`You spend minutes checking, not an hour assembling`,
      t`Nothing is submitted until you approve the report`,
    ],
  },
  "cash-flow-snapshot": {
    whatItDoes: [
      t`Builds a weekly picture of cash in, cash out, and what's coming due`,
      t`Pulls from invoices, bills, and balances in the tools you connect`,
      t`Flags a tight week early, including large bills or late payments`,
      t`Keeps the snapshot short enough to read in a minute`,
    ],
    howItHelps: [
      t`You see a cash crunch coming while you can still do something about it`,
      t`You don't have to rebuild the same picture from three tools every Monday`,
      t`The week starts with a clear number, not a guess`,
      t`It's a briefing only; it never moves money or pays a bill`,
    ],
  },
  "content-calendar-planner": {
    whatItDoes: [
      t`Plans a month of posts, newsletters, or videos from your topics and dates`,
      t`Turns the month into a week-by-week list so you know what's next`,
      t`Flags a thin week, a clash, or a promised piece that isn't drafted yet`,
      t`Adjusts the plan when a date or campaign changes, and shows you the draft`,
    ],
    howItHelps: [
      t`You stop starting the week unsure what to publish`,
      t`The month has a shape before it's already half over`,
      t`Gaps and clashes show up while there's still time to fix them`,
      t`Nothing is scheduled or posted until you approve the plan`,
    ],
  },
  "social-post-repurposer": {
    whatItDoes: [
      t`Turns one blog, video, or newsletter into a week of short posts`,
      t`Drafts each post in the voice and length that fits the channel`,
      t`Keeps the key point of the original, instead of inventing a new angle`,
      t`Groups the drafts so you can approve a week's worth at once`,
    ],
    howItHelps: [
      t`One piece of work fills the week, instead of five blank posts`,
      t`Your voice stays consistent across channels`,
      t`You review a set of drafts, not a staring contest with an empty composer`,
      t`Nothing is posted until you say yes`,
    ],
  },
  "newsletter-drafter": {
    whatItDoes: [
      t`Drafts your newsletter from what actually happened this period`,
      t`Suggests subject lines and a clear structure, then writes the body`,
      t`Pulls in the links, wins, and updates you already have`,
      t`Revises from your notes so the next draft is closer to your voice`,
    ],
    howItHelps: [
      t`The newsletter starts from a draft, not from a blank page on send day`,
      t`You don't have to remember everything that happened this month`,
      t`Subject lines and structure are already options you can pick from`,
      t`Nothing is sent to your list until you approve it`,
    ],
  },
  "lead-follow-up": {
    whatItDoes: [
      t`Spots new inquiries quickly and puts them in one list`,
      t`Drafts a first reply and the next follow-up in your voice`,
      t`Tracks who has been answered, who is waiting, and who has gone quiet`,
      t`Flags a lead that's cooling off so you can decide whether to try again`,
    ],
    howItHelps: [
      t`New leads get a draft reply while they're still warm`,
      t`You don't lose an inquiry in a busy inbox`,
      t`Follow-up is a review of drafts, not a hunt through old threads`,
      t`No reply is sent until you approve it`,
    ],
  },
  "campaign-recap": {
    whatItDoes: [
      t`Writes a plain-English weekly recap of what your marketing did`,
      t`Pulls the numbers and the work into one short brief`,
      t`Flags what worked, what didn't, and what to try next`,
      t`Keeps the recap short enough to read before a meeting`,
    ],
    howItHelps: [
      t`You can see the week's marketing without opening five dashboards`,
      t`The meeting starts from a recap, not from a scramble for numbers`,
      t`It's clear what to repeat and what to drop`,
      t`The recap is for you to use; nothing is published until you say so`,
    ],
  },
  "sop-process-tracker": {
    whatItDoes: [
      t`Keeps your SOP library complete, with an owner and a last-reviewed date`,
      t`Flags missing, stale, or unowned processes before they cause a miss`,
      t`Reminds the owner when a review is due`,
      t`Drafts the update list so you can assign or refresh what needs work`,
    ],
    howItHelps: [
      t`You know which processes are actually current, not just filed`,
      t`A stale SOP gets flagged before someone follows the old steps`,
      t`Reviews happen on a rhythm, not only after something goes wrong`,
      t`No SOP is changed or published until you approve it`,
    ],
  },
  "meeting-action-items": {
    whatItDoes: [
      t`Turns a meeting into notes, decisions, owners, and due dates`,
      t`Drafts the follow-ups so each owner can see what they owe`,
      t`Chases open actions before the next meeting, and flags what's still stuck`,
      t`Files the notes where the team already looks`,
    ],
    howItHelps: [
      t`Meetings end with a clear list, not with a fading memory of who said what`,
      t`Follow-ups go out as drafts, so you aren't typing them late in the day`,
      t`Open actions don't disappear until the next awkward recap`,
      t`Notes and reminders only go out once you have approved them`,
    ],
  },
  "weekly-ops-report": {
    whatItDoes: [
      t`Builds a one-page picture of the week's numbers, wins, and problems`,
      t`Pulls from the work that actually happened, not from a blank recap`,
      t`Flags anything that needs a decision in the week ahead`,
      t`Keeps the report short enough to read at the start of a meeting`,
    ],
    howItHelps: [
      t`You get the week's ops story without assembling it by hand`,
      t`Problems show up in time for the Monday meeting, not after it`,
      t`The team can start from the same page`,
      t`The report stays a draft until you approve it`,
    ],
  },
  "vendor-tracker": {
    whatItDoes: [
      t`Tracks vendors, contracts, and renewal dates in one place`,
      t`Warns you before a renewal, so you have time to review or cancel`,
      t`Notes what's included, what's due, and who owns the relationship`,
      t`Flags a missing contract, a price change, or a vendor that's gone quiet`,
    ],
    howItHelps: [
      t`Renewals stop sneaking up on you`,
      t`You can see what you're paying for without digging through old threads`,
      t`A vendor problem shows up while you can still switch or renegotiate`,
      t`Nothing is signed, cancelled, or sent until you approve it`,
    ],
  },
  "project-status-updates": {
    whatItDoes: [
      t`Writes a weekly status update for each project you ask it to watch`,
      t`Flags blockers and slipping dates early, with who owns the next step`,
      t`Pulls from the notes, tasks, and messages already in your tools`,
      t`Keeps the update short and in the format your stakeholders expect`,
    ],
    howItHelps: [
      t`You stop writing the same weekly update from scratch`,
      t`Blockers show up while there's still time to unblock them`,
      t`Stakeholders get a consistent picture, not a last-minute scramble`,
      t`The update only goes out once you have approved it`,
    ],
  },
  "morning-briefing": {
    whatItDoes: [
      t`Sends a short weekday briefing of your calendar, inbox, and what needs you`,
      t`Flags meetings that moved, overlap, or were added since yesterday`,
      t`Lists messages that ask for a decision or have a deadline, and skips the noise`,
      t`Adds weather or news only when you asked for it and it actually matters`,
    ],
    howItHelps: [
      t`You start the day knowing what needs you, without opening five apps first`,
      t`A moved meeting or a noon deadline doesn't catch you mid-morning`,
      t`The briefing stays short enough to read with coffee`,
      t`It only points things out; it never sends email or changes your calendar`,
    ],
  },
  "inbox-triage": {
    whatItDoes: [
      t`Sorts new email into reply needed, for your information, and low priority`,
      t`Drafts a reply in your voice for every message that needs one`,
      t`Applies your rules for senders and topics, and learns from corrections`,
      t`Gives you a short report, not a copy of the whole inbox`,
    ],
    howItHelps: [
      t`You only read what matters, and the replies are already drafted`,
      t`Catching up twice a day takes minutes instead of the whole inbox`,
      t`Newsletters and notifications get counted, not dumped on you`,
      t`No email is sent, deleted, or archived unless you ask`,
    ],
  },
  "pr-reviewer": {
    whatItDoes: [
      t`Finds the pull requests waiting on you and reads each one`,
      t`Drafts a review that focuses on correctness, security, and missing tests`,
      t`Quotes the file and line for every point, and suggests a verdict`,
      t`Reviews a pasted link the same way, even if the code host isn't connected`,
    ],
    howItHelps: [
      t`You start from a drafted review, not from a cold pull request first thing`,
      t`The important issues are already called out, with a suggested verdict`,
      t`Waiting reviews don't pile up unnoticed`,
      t`Nothing is posted, approved, or merged until you say so`,
    ],
  },
  "topic-watch": {
    whatItDoes: [
      t`Watches the topics and websites you name, and checks what changed`,
      t`Sends a weekly digest of real changes, each with a source and how recent it is`,
      t`Skips repeats and rumors, and says so when something is unconfirmed`,
      t`Remembers what it already told you, so each digest is only what's new`,
    ],
    howItHelps: [
      t`You stay current without checking the same sites every day`,
      t`You only see what's new since last week, not a pile of old news`,
      t`A pricing or policy change on a site you watch doesn't slip by`,
      t`It's a digest only; it never contacts anyone or posts on your behalf`,
    ],
  },
};

export function botTemplateCopy(template: BotTemplate): BotTemplateCopy {
  const extra = benefits[template.id] ?? {
    whatItDoes: template.whatItDoes,
    howItHelps: template.howItHelps,
  };
  const copy = (() => {
    switch (template.id) {
      case "ai-brain-keeper":
        return {
          name: t`AI brain keeper`,
          summary: t`Builds and maintains the shared brain for a client and their VAs`,
          sample: t`**Bright Smiles Dental brain: weekly check**

**Filed this week (9)**
- Decision: no same-day cancellations without a $25 fee -> Areas / Front desk
- New FAQ: do you take Delta Dental? -> Resources / FAQs
- Tue team call notes -> Projects / Holiday promo

**Stale or missing**
- Insurance claims SOP: 8 months old, the form changed
- Brand voice: no examples for text messages yet

**Access**
- Ana (new VA) starts Monday. Start-here walkthrough drafted. Share the folder with her?`,
        };
      case "sop-builder":
        return {
          name: t`SOP builder`,
          summary: t`Turns how you work into SOPs your VA can follow`,
          sample: t`**SOP draft: Processing a refund request** (v1)

- **When:** a customer asks for a refund by email or chat. Daily.
- **Tools:** Shopify, Gmail, the refunds sheet (no passwords here)

**Steps**
1. Find the order in Shopify by email or order number.
2. Check it was placed in the last 30 days. If not, use the late refund reply.
3. Log the request in the refunds sheet.
4. Refund up to $50 yourself. Over $50: [ASK OWNER]

**Never without approval:** refunds over $50, store credit, anything legal

2 questions left for you before this is final.`,
        };
      case "results-eod-report":
        return {
          name: t`Results EOD report`,
          summary: t`Your daily client report, built from real work`,
          sample: t`**EOD for Bright Smiles Dental, Tue Nov 17** (5:00 PM PST)

**Done today**
- Replied to 14 patient emails; 2 refund requests wait on your OK
- Booked 6 new appointments and confirmed tomorrow's 9 patients
- Updated the insurance SOP after the new claims form

**Needs your decision**
- Refund $120 to J. Ortiz? I recommend yes: the visit was cancelled by us.

**Tomorrow**
- Chase 3 unpaid invoices
- Draft December's newsletter`,
        };
      case "va-client-finder":
        return {
          name: t`VA client finder`,
          summary: t`Finds good-fit job posts and drafts your pitch`,
          sample: t`**4 new posts fit you today**

**1. Part-time admin VA, real estate team (US)**
- $8 to $10/hr, 20 hrs/week, Gmail and Follow Up Boss
- Why it fits: 2 years of real estate admin, CRM experience
- Proposal drafted. It opens with how you cut a broker's inbox to zero.

**2. E-commerce support VA, Shopify store**
- $6/hr, full time. Below your $7 floor; skipped unless you say so.

Watch out: post #4 asks you to pay for training. Likely a scam.`,
        };
      case "delegation-coach":
        return {
          name: t`Delegation coach`,
          summary: t`Turns quick asks into clear briefs for your VA`,
          sample: t`**Brief: Clean up the client list** (for Maria)

- **Goal:** one up-to-date list we can send the holiday promo to
- **Due:** Fri Nov 20, 3:00 PM EST
- **Decide yourself:** merge duplicates, fix typos
- **Ask me first:** deleting anyone who bought this year
- **Done looks like:** one sheet, no duplicates, a count of removed rows
- **Example:** last year's list in Drive, Promo 2025

Questions for you before I send: is the promo for retail clients only?`,
        };
      case "ai-upskill-coach":
        return {
          name: t`AI upskill coach`,
          summary: t`Weekly AI lessons so you sell you plus your bots`,
          sample: t`**Week 3: Let a bot draft, you decide**

**Why clients care:** inbox help is the most-asked VA task. Doing it 2x faster with AI is a reason to keep you, not replace you.

**Try it (20 min)**
1. Paste 5 old emails (remove names) and ask for reply drafts in your client's tone.
2. Fix each draft. Note what you changed.
3. Write the 3 rules you'd give the bot next time.

**Say it to clients:** "I use AI to draft and I check every reply, so you get faster answers without mistakes."

Next week: turning an SOP into a bot skill.`,
        };
      case "get-paid-back-office":
        return {
          name: t`Get paid back office`,
          summary: t`Invoices, payment reminders and hours per client`,
          sample: t`**Billing check, Mon Dec 1**

**Invoices ready to send (drafts)**
- Bright Smiles Dental: 82 hrs x $8 = $656, due Dec 15
- Oak Realty: monthly retainer $500, due Dec 5

**Overdue**
- Peak Fitness: $240, 9 days late. Friendly reminder drafted.

**Heads-up:** Peak Fitness paid late 3 months in a row. Consider asking for payment upfront.`,
        };
      case "scope-rate-guard":
        return {
          name: t`Scope and rate guard`,
          summary: t`Spots work beyond your deal and drafts a rate talk`,
          sample: t`**Scope check: Oak Realty, last week**

**Agreed:** inbox, calendar, listing updates (20 hrs/week, $500/month)

**New since the deal**
- Social media posts, 4 hrs (first asked Nov 3)
- Bookkeeping in QuickBooks, 3 hrs (first asked Nov 10)

That's 7 extra hours a week, about 35% more work.

Rate review message drafted: thanks them, lists the new tasks, offers $650/month or dropping the social posts.`,
        };
      case "inbox-admin-triage":
        return {
          name: t`Inbox and admin triage`,
          summary: t`Sorts email, drafts replies, tidies the calendar`,
          sample: t`**38 new since 8:00 AM**

**Reply needed (drafts ready for your VA to check)**
1. A patient wants to reschedule Thursday. Draft offers Fri 10:00 or 2:00.
2. Supplier invoice $1,240 is due Monday. Draft asks for the W-9.

**You decide**
- A refund request for $300. Over your VA's limit.

**Calendar**: Wed has two overlapping calls at 2:00 PM.

**Low priority**: 29 newsletters and notifications`,
        };
      case "night-shift-handoff":
        return {
          name: t`Night-shift handoff`,
          summary: t`Bridges the US and PH time gap with daily handoffs`,
          sample: t`**Handoff for Jen, Tue 8:00 AM EST** (9:00 PM PHT)

**Done overnight**
- 22 customer emails answered, 3 refunds waiting on you
- New-hire packet sent to Carlos

**Questions queued for you**
1. Ship the Hendricks order without the missing part? Default if no answer by 5:00 PM EST: hold it.
2. OK to move the Thursday call to 11:00 AM EST?

**Tonight I'll do**: invoices, the promo email draft`,
        };
      case "va-onboarding-kit":
        return {
          name: t`VA onboarding kit`,
          summary: t`Runs a new VA's first two weeks, day by day`,
          sample: t`**Day 3 of 10: Maria at Oak Realty**

**Access**: 5 of 7 ready. Still missing: CRM login (owner), shared calendar (owner)

**Today's focus**: answer listing inquiries using the inquiry SOP

**Check-in questions for Maria**
1. Anything in the SOP that didn't match what you saw?
2. What took longest yesterday?

**Owner to-do**: 15-minute call by 4:00 PM EST (5:00 AM PHT)`,
        };
      case "va-business-manager":
        return {
          name: t`VA business manager`,
          summary: t`Runs your VA business like a business: income, clients, hours and next moves`,
          sample: t`**Your VA business, week of Nov 23**

**Income**: $1,180 billed of your $1,400 goal this month. 1 invoice ($320) is 9 days late.
**Clients**: 2 active. Bright Smiles is 70% of your income, so losing it would hurt. Aim for a third client.
**Hours**: 46 this week, 12 of them after midnight. That's 2 weeks in a row over your 40-hour limit.
**Pipeline**: 3 proposals out, 1 reply. A discovery call is pencilled in for Thu 9:00 AM EST (10:00 PM PHT).

**This week's 3 moves**
1. Approve the late-payment reminder drafted for Lopez Realty
2. Send the rate review note to Bright Smiles (your rate hasn't changed in 14 months)
3. Finish the AI upskill lesson on inbox automations`,
        };
      case "client-va-sync":
        return {
          name: t`Client and VA sync`,
          summary: t`Keeps a client and their VA on one priority list, across time zones`,
          sample: t`**Bright Smiles: Jen and Ana, week of Nov 23**

**Priorities (agreed Mon)**
1. Holiday promo emails: draft due Wed 5:00 PM EST (Thu 6:00 AM PHT)
2. Insurance claims SOP: Ana updates it after the new form
3. Patient reminders: keep at 100% confirmed

**Changed since Monday**: Jen added a dentist hiring post. It bumps #2 to next week unless Jen says otherwise.

**Monday sync agenda (15 min, 9:00 AM EST / 10:00 PM PHT)**
- Wins: 31 appointments booked, 0 missed reminders
- 2 decisions for Jen
- Feedback both ways: what to keep, what to change`,
        };
      case "calendar-keeper":
        return {
          name: t`Calendar keeper`,
          summary: t`Plans the day, protects focus time and drafts every scheduling reply`,
          sample: t`**Tomorrow, Tue Nov 24** (times in EST, PHT in brackets)

- 9:00 AM (10:00 PM) Team standup
- 10:00 to 12:00 (11:00 PM to 1:00 AM) Focus block, protected
- 2:00 PM (3:00 AM) Call with Lopez Realty. No agenda yet; I drafted one.

**Conflict**: the dentist at 3:30 PM overlaps the supplier call. Move the supplier to Wed 11:00 AM?

**Scheduling replies drafted (2)**
- Mark asked for 30 min this week: offered Wed 1:00 PM or Thu 10:00 AM
- Webinar invite for Thursday: suggested no, it clashes with month-end`,
        };
      case "agency-ops-manager":
        return {
          name: t`VA agency ops`,
          summary: t`For agency owners: clients, VAs, coverage and retainer hours in one view`,
          sample: t`**Agency week, Mon Nov 23**: 9 clients, 7 VAs

**Coverage**
- Ana is off Thu and Fri. Bright Smiles has no backup; Carla knows their SOPs. Assign her?

**Retainer hours**
- Lopez Realty used 38 of 40 hours with 8 days left. Draft a top-up note?
- Peak Fitness used 12 of 30. Worth a check-in.

**Client health**: 7 good, 1 watch (2 late payments), 1 at risk (no reply in 10 days)
**VA load**: Marco is at 52 hours, mostly night shift. Move one client?

**Needs you**: 3 decisions above, plus the new client intake for Rivera Law.`,
        };
      case "receipt-categorizer":
        return {
          name: t`Receipt sorter`,
          summary: t`Finds receipts, sorts expenses and flags what's missing`,
          sample: t`**Receipts, week of Nov 16**

**Sorted (14)**
- Adobe, $59.99: Software subscriptions
- Shell, $48.20: Vehicle fuel
- Staples, $112.35: Office supplies
- ...and 11 more in the sheet

**Needs you (2)**
- Amazon, $86.10: office or personal? Not sure
- Card charge, $240 at Delta: no receipt found yet

Ready for you to enter in QuickBooks. Nothing was changed there.`,
        };
      case "ar-follow-up":
        return {
          name: t`Invoice follow-up`,
          summary: t`Tracks who owes you and drafts polite reminders`,
          sample: t`**Unpaid invoices, Mon Nov 23**

**Total owed: $8,450** across 6 customers

**Overdue**
- Riverside Cafe, #1042, $1,200: 12 days late. Second reminder drafted.
- Kim Landscaping, #1038, $640: 35 days late. Call script drafted.

**Due this week**
- Harbor Dental, #1047, $2,300 on Fri. Friendly heads-up drafted.

Nothing sent. Say which drafts to send.`,
        };
      case "month-end-close":
        return {
          name: t`Month-end close`,
          summary: t`Runs your month-end checklist and chases what's missing`,
          sample: t`**November close: 9 of 14 done**

**Done**
- Bank and card accounts reconciled
- Payroll entries checked

**Waiting**
- 3 receipts from Mark (asked Tuesday)
- Sales tax report: due Dec 20

**Questions for the accountant**
- Is the new laptop an asset or an expense?

Target: close by Dec 7. On track.`,
        };
      case "expense-report-prep":
        return {
          name: t`Expense report prep`,
          summary: t`Turns receipts into a ready-to-approve expense report`,
          sample: t`**Expense report: Dana Lee, Chicago trip (Nov 10 to 13)**

| Date | Item | Amount |
|---|---|---|
| Nov 10 | Flight | $412.80 |
| Nov 10 to 13 | Hotel, 3 nights | $687.00 |
| Nov 11 | Client dinner, 4 people | $236.40 |

**Total: $1,336.20**

**Check before approving**
- Dinner is over the $50 per person limit
- No receipt for the Nov 12 taxi ($38)`,
        };
      case "cash-flow-snapshot":
        return {
          name: t`Cash-flow snapshot`,
          summary: t`A weekly look at cash in, cash out and what's coming`,
          sample: t`**Cash snapshot, Mon Nov 23**

- **Cash today:** $18,400 (from your Friday update)
- **Coming in (next 4 weeks):** $12,750 from 7 invoices
- **Going out:** $15,900 (payroll x2, rent, software, tax payment)

**Lowest point:** about $9,800 on Dec 15, after payroll

**Worth a look**
- $4,200 of what's coming in is from one late payer
- Software costs are up 18% from 3 months ago`,
        };
      case "content-calendar-planner":
        return {
          name: t`Content calendar`,
          summary: t`Plans a month of posts and keeps the week on track`,
          sample: t`**December content plan** (12 posts, 1 newsletter)

**Week 1: Holiday hours**
- Mon, Instagram: behind-the-scenes prep (photo)
- Wed, Facebook: holiday hours graphic
- Fri, newsletter: gift card offer

**Week 2: Customer stories**
- Tue, Instagram: before and after, the Lopez kitchen
- Thu, LinkedIn: what we learned from 100 remodels

**Needs you:** 3 photos from the Lopez job, and OK the 10% offer`,
        };
      case "social-post-repurposer":
        return {
          name: t`Social post repurposer`,
          summary: t`Turns one blog, video or newsletter into a week of posts`,
          sample: t`**From: "5 signs your roof needs repair" (blog)**

**Instagram carousel (5 slides)**
Slide 1: Is your roof trying to tell you something?

**Facebook**
Most roof leaks start small. Here are the 3 signs we see most often, and when it's safe to wait...

**LinkedIn**
After 12 years of repairs, the most expensive problems we see started as a $200 fix.

**Short video script (30 sec)** ready below.`,
        };
      case "newsletter-drafter":
        return {
          name: t`Newsletter drafter`,
          summary: t`Drafts your monthly email newsletter from what happened`,
          sample: t`**Subject ideas**
1. Our holiday hours (and a small thank-you)
2. 3 things we learned this year

**Preview:** A quick note from all of us at Bloom Florals...

**Inside**
- New: winter wreath workshop, Dec 12
- Customer pick: the Harris wedding
- Tip: keep cut flowers fresh twice as long
- Holiday hours

Draft ready for your edits. Paste into Mailchimp when you're happy.`,
        };
      case "lead-follow-up":
        return {
          name: t`Lead follow-up`,
          summary: t`Spots new inquiries fast and drafts the follow-ups`,
          sample: t`**3 new leads since yesterday**

1. **Maria G.**, kitchen remodel quote (web form, 7:42 AM)
   Draft: "Thanks Maria! Could you send 2 or 3 photos of the space? I have Thu 10 AM or Fri 2 PM for a call."
2. **Ben T.**, asked about pricing (Facebook, via email)
   Draft ready with the price sheet.

**Follow-ups due**
- Ana R., no reply in 3 days. Gentle nudge drafted.

Average first reply yesterday: 2 hrs 10 min.`,
        };
      case "campaign-recap":
        return {
          name: t`Campaign recap`,
          summary: t`A plain-English weekly recap of what your marketing did`,
          sample: t`**Marketing recap, week of Nov 16**

**Headline:** the holiday email drove 14 bookings, your best week this quarter.

| Channel | Spend | Leads | Cost per lead |
|---|---|---|---|
| Facebook ads | $320 | 18 | $17.78 |
| Google ads | $410 | 11 | $37.27 |
| Email | $0 | 14 | n/a |

**Try next week:** move $100 from Google to Facebook, and resend the email to non-openers.`,
        };
      case "sop-process-tracker":
        return {
          name: t`Process tracker`,
          summary: t`Keeps your SOP library complete, owned and up to date`,
          sample: t`**Process library check, Dec 1**

**42 SOPs**: 35 current, 5 due for review, 2 with no owner

**Due for review**
- Refund requests (last checked 7 months ago, owner: Maria)
- New client onboarding (the intake form changed in October)

**Missing**
- Payroll cut-off: done every 2 weeks, no SOP yet

Review reminders drafted for Maria and Joel.`,
        };
      case "meeting-action-items":
        return {
          name: t`Meeting notes and actions`,
          summary: t`Turns meetings into notes, owners and follow-ups`,
          sample: t`**Weekly team sync, Tue Nov 17**

**Decided**
- Move the spring sale to March 3
- Hire a second part-time VA for support

**Action items**
- Joel: draft the VA job post, by Fri
- Maria: update the sale landing page, by Mar 1
- You: approve the support budget, by Thu

**Open from last week**
- Vendor quotes (Ana), 4 days overdue

Recap email drafted for the 5 attendees.`,
        };
      case "weekly-ops-report":
        return {
          name: t`Weekly ops report`,
          summary: t`Your business's week in one page: numbers, wins, problems`,
          sample: t`**Ops report, week of Nov 16**

**Numbers**
- Orders: 184 (up 12%)
- Support tickets: 63, average first reply 3.1 hrs
- On-time deliveries: 96%

**Wins**
- New returns SOP cut handling time in half

**Problems**
- 2 late shipments from the Ohio supplier, again

**Decisions for you:** extend support hours to Saturday?`,
        };
      case "vendor-tracker":
        return {
          name: t`Vendor tracker`,
          summary: t`Tracks vendors, contracts and renewals before they bite`,
          sample: t`**Vendors, Dec 1**

**Renewing soon**
- Zoom, $1,440/yr: auto-renews Dec 18. Only 3 of 8 seats used last month.
- Office cleaning: contract ends Jan 1. 2 other quotes requested?

**Open issues**
- Ohio supplier: 2 late shipments in November. Draft check-in ready.

**Price changes**
- Shipping supplies up 9% on the last invoice`,
        };
      case "project-status-updates":
        return {
          name: t`Project status updates`,
          summary: t`Weekly project updates and early warnings on blockers`,
          sample: t`**Projects, week of Nov 23**

**Website refresh**: on track
- Done: new home page copy approved
- Next: product photos (Joel, due Wed)

**Holiday catalog**: at risk
- Printer needs final files by Dec 1; 6 of 20 pages left
- Blocker: waiting on prices from the owner

**CRM cleanup**: done. 1,240 duplicates merged.

Updates drafted for #projects. Nothing posted.`,
        };
      case "morning-briefing":
        return {
          name: t`Morning briefing`,
          summary: t`Your day at a glance, every weekday morning`,
          sample: t`**Thursday**

**Calendar**
- 10:00 Design review, moved to 11:30
- 14:00 Call with Dana

**Needs you**
- Alex asked for the Q4 numbers by noon
- A contract is waiting for your signature

**Worth knowing**
- Light rain after 4pm
- Two stories on the topics you follow`,
        };
      case "inbox-triage":
        return {
          name: t`Inbox triage`,
          summary: t`Sorts new email and drafts the replies`,
          sample: t`**12 new since 8:00**

**Reply needed**
1. Priya wants to move Friday's review. Draft: "Friday works if we start at 2."
2. Your card expires on the 30th. Draft ready.
3. Sam asked about the API limits. Draft ready.

**For your information**: a shipping update and a calendar change

**Low priority**: 7 newsletters and notifications`,
        };
      case "pr-reviewer":
        return {
          name: t`PR reviewer`,
          summary: t`Reviews pull requests waiting on you`,
          sample: t`**2 pull requests are waiting on you**

**#482 Add retry to webhook delivery**
- Retries on 404 too, so a deleted endpoint is retried five times. Retry only 5xx and timeouts?
- No test for the backoff cap.

Suggested review: request changes.

**#479 Fix date parsing in reports**
Looks good. Suggested review: approve.`,
        };
      case "topic-watch":
        return {
          name: t`Topic watch`,
          summary: t`A weekly digest of what changed on topics you follow`,
          sample: t`**This week**

**Open-source AI agents**
- A major release adds scheduled tasks (3 days ago)
- Two new comparisons; both call memory the main gap

**competitor.example**
- Pricing: the Team plan went from $20 to $25 per seat

Nothing new on battery recycling.`,
        };
      default:
        return template;
    }
  })();
  return { ...copy, ...extra };
}

/** A template category's name in the app's language, for the templates list's filter. */
export function botTemplateCategoryLabel(category: BotTemplateCategory): string {
  switch (category) {
    case "virtual-assistants":
      return t`Virtual assistants`;
    case "accounting-finance":
      return t`Accounting & finance`;
    case "marketing":
      return t`Marketing`;
    case "operations":
      return t`Operations`;
    case "productivity":
      return t`Productivity`;
  }
}
