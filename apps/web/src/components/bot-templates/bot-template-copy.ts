import { useLingui } from "@lingui/react/macro";
import type { BotTemplate, BotTemplateCategory } from "@rakazo/contracts";

export type BotTemplateCopy = Pick<BotTemplate, "name" | "summary" | "sample">;

/**
 * Each template's name, summary and sample in the app's language. The English here must match
 * `BOT_TEMPLATES` (a test checks); a template without copy here shows the server's English.
 */
export function useBotTemplateCopy(): (template: BotTemplate) => BotTemplateCopy {
  const { t } = useLingui();
  return (template) => {
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
  };
}

/** A template category's name in the app's language, for the templates page's filter. */
export function useBotTemplateCategoryLabel(): (category: BotTemplateCategory) => string {
  const { t } = useLingui();
  return (category) => {
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
  };
}
