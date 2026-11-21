import { t } from "@lingui/core/macro";
import type { BotTemplate } from "@rakazo/contracts";

export type BotTemplateCopy = Pick<BotTemplate, "name" | "summary" | "sample">;

/**
 * Each template's name, summary and sample in the app's language. The English here must match
 * `BOT_TEMPLATES` (a test checks); a template without copy here shows the server's English.
 */
export function botTemplateCopy(template: BotTemplate): BotTemplateCopy {
  switch (template.id) {
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
}
