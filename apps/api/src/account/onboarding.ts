import type { ConnectorRegistry } from "@rakazo/adapters";
import type { Actor, ConnectionCatalogItem, MessageBlock, SignupSurvey } from "@rakazo/contracts";
import { SignupSurveySchema } from "@rakazo/contracts";
import type { StarterPick } from "@rakazo/core";
import {
  appConnectCard,
  connectedAppBlock,
  matchAppCatalog,
  recommendStarter,
  starterTemplate,
} from "@rakazo/core";
import type { Prisma, PrismaClient, ThreadEvents } from "@rakazo/db";
import {
  appendEventInTransaction,
  changeMessageBlocks,
  createThreadMessageInTransaction,
  IsolationError,
  storedMessageBlocks,
  THREAD_LOCK_TRANSACTION_OPTIONS,
} from "@rakazo/db";
import { requireBotThread } from "../bots/bot-thread.js";
import { resolveThreadTarget } from "../threads/thread-target.js";

/**
 * First-run conversational onboarding, seeded deterministically into the bot's
 * thread: greeting, a focus choice, and available app cards the user authorizes
 * inline. Focus must not rename the bot. No model tokens are spent.
 */

type OnboardingDeps = {
  prisma: PrismaClient;
  events: ThreadEvents;
  connectors: ConnectorRegistry;
};

type FocusOption = {
  id: string;
  letter: string;
  label: string;
  summary: string;
  apps: string[];
};

const FOCUS_OPTIONS: FocusOption[] = [
  {
    id: "day",
    letter: "A",
    label: "Day-to-day work",
    summary: "Slack, calendar, and email",
    apps: ["slack", "gmail", "googlecalendar"],
  },
  {
    id: "inbox",
    letter: "B",
    label: "Inbox & email",
    summary: "email and calendar",
    apps: ["gmail", "googlecalendar", "slack"],
  },
  {
    id: "research",
    letter: "C",
    label: "Research & writing",
    summary: "the web, notes, and docs",
    apps: ["hackernews", "notion", "googledocs"],
  },
  {
    id: "everything",
    letter: "D",
    label: "A bit of everything",
    summary: "Slack, calendar, and email",
    apps: ["slack", "gmail", "googlecalendar"],
  },
];

async function post(
  deps: OnboardingDeps,
  target: { spaceId: string; botId: string; threadId: string },
  blocks: MessageBlock[],
  markUnread = true,
): Promise<string> {
  const committed = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const message = await createThreadMessageInTransaction(tx, {
      threadId: target.threadId,
      role: "bot",
      markUnread,
      blocks,
    });
    const event = await appendEventInTransaction(tx, {
      spaceId: target.spaceId,
      threadId: target.threadId,
      botId: target.botId,
      type: "thread.message.created",
      payload: { messageId: message.id, role: "bot", blocks },
    });
    return { message, event };
  });
  await deps.events.notify(target.threadId, committed.event.seq);
  return committed.message.id;
}

/** Every managed provider's apps; a provider that fails or takes over 15s is left out. */
export async function managedAppCatalog(
  connectors: ConnectorRegistry,
  actor: Actor,
  operationId: string,
  botId?: string,
  timeoutMs = 15_000,
): Promise<ConnectionCatalogItem[]> {
  const signal = AbortSignal.timeout(timeoutMs);
  // A provider may ignore the signal, so the wait itself gives up when it fires.
  const givenUp = new Promise<ConnectionCatalogItem[]>((resolve) => {
    signal.addEventListener("abort", () => resolve([]), { once: true });
  });
  const catalogs = await Promise.all(
    connectors.managedProviders().map((provider) =>
      Promise.race([
        provider
          .catalog({
            operationId,
            traceId: operationId,
            spaceId: actor.spaceId,
            userId: actor.userId,
            botId,
            signal,
          })
          .catch(() => []),
        givenUp,
      ]),
    ),
  );
  return catalogs.flat();
}

/** Sentinel answerId for a focus card the user dismissed without choosing. */
export const FOCUS_DISMISSED_ANSWER_ID = "_dismissed";

export async function startOnboarding(
  deps: OnboardingDeps,
  actor: Actor,
  botId: string,
): Promise<void> {
  const { thread } = await requireBotThread(deps, actor, botId);
  const existing = await deps.prisma.message.count({ where: { threadId: thread.id } });
  if (existing > 0) return;
  // The focus card is posted later via promptFocus so non-first bots can wait ~10s for
  // free typing, or skip if the user already engaged.
}

/** A focus card, or a question the bot asked itself; either way the thread already asks. */
function messageHasChoiceOrAsk(blocks: MessageBlock[]): boolean {
  return blocks.some((block) => block.kind === "choice" || block.kind === "ask");
}

function messageHasPendingChoice(blocks: MessageBlock[]): boolean {
  return blocks.some((block) => block.kind === "choice" && !block.answerId);
}

export async function promptFocus(
  deps: OnboardingDeps,
  actor: Actor,
  botId: string,
): Promise<void> {
  const { bot, thread } = await requireBotThread(deps, actor, botId);
  const target = { spaceId: actor.spaceId, botId: bot.id, threadId: thread.id };
  const blocks: MessageBlock[] = [
    {
      kind: "choice",
      question: "What do you want me on first?",
      options: FOCUS_OPTIONS.map(({ id, letter, label }) => ({ id, letter, label })),
    },
  ];
  // Check + insert + event in one transaction so concurrent promptFocus calls
  // cannot duplicate cards, and a concurrent user send cannot publish first.
  const committed = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRaw`SELECT id FROM threads WHERE id = ${thread.id} FOR UPDATE`;
    const recent = await tx.message.findMany({
      where: { threadId: thread.id },
      select: { id: true, role: true, blocks: true },
      orderBy: { createdAt: "asc" },
    });
    if (recent.some((message) => message.role === "user")) return null;
    if (recent.some((message) => messageHasChoiceOrAsk(storedMessageBlocks(message)))) return null;
    // A bot whose creation intro is running asks what it is for itself (see enqueueBotIntroRun).
    const intro = await tx.run.findFirst({
      where: {
        threadId: thread.id,
        trigger: "created",
        status: { notIn: ["failed", "cancelled"] },
      },
      select: { id: true },
    });
    if (intro) return null;
    const message = await createThreadMessageInTransaction(tx, {
      threadId: target.threadId,
      role: "bot",
      markUnread: false,
      blocks,
    });
    const event = await appendEventInTransaction(tx, {
      spaceId: target.spaceId,
      threadId: target.threadId,
      botId: target.botId,
      type: "thread.message.created",
      payload: { messageId: message.id, role: "bot", blocks },
    });
    return { message, event };
  }, THREAD_LOCK_TRANSACTION_OPTIONS);
  if (!committed) return;
  await deps.events.notify(target.threadId, committed.event.seq);
}

/** Answer the first pending choice and notify after the transaction commits. */
async function answerPendingChoice(
  deps: OnboardingDeps,
  target: { spaceId: string; botId: string; threadId: string },
  mapBlock: (block: MessageBlock) => MessageBlock,
): Promise<boolean> {
  const claimed = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRaw`SELECT id FROM threads WHERE id = ${target.threadId} FOR UPDATE`;
    const recent = await tx.message.findMany({
      where: { threadId: target.threadId },
      orderBy: { createdAt: "asc" },
    });
    const pending = recent.find((message) => messageHasPendingChoice(storedMessageBlocks(message)));
    if (!pending) return null;
    const next = changeMessageBlocks(pending, mapBlock);
    if (!next) return null;
    const { blocks } = next;
    await tx.message.update({ where: { id: pending.id }, data: { blocks: next.stored } });
    const event = await appendEventInTransaction(tx, {
      spaceId: target.spaceId,
      threadId: target.threadId,
      botId: target.botId,
      type: "thread.message.updated",
      payload: { messageId: pending.id, role: "bot", blocks },
    });
    return event;
  }, THREAD_LOCK_TRANSACTION_OPTIONS);
  if (!claimed) return false;
  await deps.events.notify(target.threadId, claimed.seq);
  return true;
}

export async function dismissFocus(
  deps: OnboardingDeps,
  actor: Actor,
  botId: string,
): Promise<void> {
  const { bot, thread } = await requireBotThread(deps, actor, botId);
  const target = { spaceId: actor.spaceId, botId: bot.id, threadId: thread.id };
  await answerPendingChoice(deps, target, (block) =>
    block.kind === "choice" && !block.answerId
      ? { ...block, answerId: FOCUS_DISMISSED_ANSWER_ID }
      : block,
  );
}

export async function chooseFocus(
  deps: OnboardingDeps,
  actor: Actor,
  botId: string,
  optionId: string,
): Promise<void> {
  const option = FOCUS_OPTIONS.find((entry) => entry.id === optionId);
  if (!option) throw new IsolationError();
  const { bot, thread } = await requireBotThread(deps, actor, botId);
  const target = { spaceId: actor.spaceId, botId: bot.id, threadId: thread.id };

  const claimed = await answerPendingChoice(deps, target, (block) =>
    block.kind === "choice" ? { ...block, answerId: option.id } : block,
  );
  if (!claimed) return;

  // Keep the name and title the user chose when creating the bot; the focus
  // step only suggests apps, it must not rename the bot.
  await post(
    deps,
    target,
    [
      {
        kind: "text",
        text: `Got it. ${capitalize(option.summary)}. I’ll see what’s already connected so I don’t make you set something up twice.`,
      },
    ],
    false,
  );

  const catalog = await managedAppCatalog(deps.connectors, actor, "onboarding.choose", bot.id);
  const cards: MessageBlock[] = option.apps.flatMap((slug) => {
    const entry = matchAppCatalog(catalog, slug);
    return entry ? [appConnectCard(entry)] : [];
  });
  if (!cards.length) {
    await post(deps, target, [{ kind: "text", text: "What would you like to work on first?" }]);
    return;
  }
  const cardNames = cards
    .map((card) => (card.kind === "app_connect" ? card.name : ""))
    .filter(Boolean);
  const named = `${cardNames.slice(0, -1).join(", ")}${cardNames.length > 1 ? ", and " : ""}${cardNames.at(-1)}`;
  await post(deps, target, [
    {
      kind: "text",
      text: `${named} are a good place to start. Connect them here and I’ll use what you already have.`,
    },
  ]);
  await post(deps, target, cards);
  await post(deps, target, [
    {
      kind: "text",
      text: `Hit those ${cards.length === 1 ? "one" : cards.length === 2 ? "two" : "three"} and I’ll start pulling the picture.`,
    },
  ]);
}

export async function markAppConnected(
  deps: OnboardingDeps,
  actor: Actor,
  botId: string,
  provider: string,
  connectorId = deps.connectors.defaultConnectorId,
  threadId?: string,
  messageId?: string,
): Promise<void> {
  const { bot, thread: ownThread } = await requireBotThread(deps, actor, botId);
  let thread = ownThread;
  if (threadId && threadId !== ownThread.id) {
    const candidate = await deps.prisma.thread.findFirst({
      where: { id: threadId, spaceId: actor.spaceId },
    });
    if (!candidate?.groupId) throw new IsolationError();
    const target = await resolveThreadTarget(deps.prisma, actor, { groupId: candidate.groupId });
    if (target.kind !== "group" || !target.memberBotIds.includes(botId)) throw new IsolationError();
    thread = { ...ownThread, id: target.threadId };
  }
  const providerAdapter = deps.connectors.managed(connectorId);
  if (!providerAdapter) return;
  const catalog = await providerAdapter.catalog(
    {
      operationId: "onboarding.appConnected",
      traceId: "onboarding.appConnected",
      spaceId: actor.spaceId,
      userId: actor.userId,
      botId,
      signal: AbortSignal.timeout(15_000),
    },
    provider,
  );
  const entry = matchAppCatalog(
    catalog.filter((item) => item.connectorId === connectorId),
    provider,
  );
  if (!entry?.connected) return;
  const target = { spaceId: actor.spaceId, botId: bot.id, threadId: thread.id };
  const updates = await deps.prisma.$transaction(async (tx) => {
    // Two authorizations may finish together on an onboarding message with multiple cards.
    await tx.$executeRaw`SELECT id FROM threads WHERE id = ${thread.id} FOR UPDATE`;
    // Onboarding cards sit at the start of the chat and inline cards near the end;
    // bound both reads so a long chat is never scanned in full.
    const select = { id: true, blocks: true } as const;
    const first = await tx.message.findMany({
      where: { threadId: thread.id },
      select,
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    const latest = await tx.message.findMany({
      where: { threadId: thread.id },
      select,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    const own = messageId
      ? await tx.message.findMany({ where: { id: messageId, threadId: thread.id }, select })
      : [];
    const messages = [...new Map([...first, ...latest, ...own].map((m) => [m.id, m])).values()];
    const events = [];
    for (const message of messages) {
      const next = changeMessageBlocks(message, (block) =>
        connectedAppBlock(block, connectorId, entry.slug, deps.connectors.defaultConnectorId),
      );
      if (!next) continue;
      await tx.message.update({ where: { id: message.id }, data: { blocks: next.stored } });
      events.push(
        await appendEventInTransaction(tx, {
          ...target,
          type: "thread.message.updated",
          payload: { messageId: message.id, role: "bot", blocks: next.blocks },
        }),
      );
    }
    return events;
  }, THREAD_LOCK_TRANSACTION_OPTIONS);
  for (const event of updates) await deps.events.notify(thread.id, event.seq);
}

function capitalize(value: string): string {
  return value.length > 0 ? (value[0] ?? "").toUpperCase() + value.slice(1) : value;
}

/** Choice ids on Wea's starter card; the start option carries the pick it was shown with. */
const STARTER_PREFIX = "starter:";
const STARTER_BROWSE = "starter:browse";
const STARTER_CHAT = "starter:chat";

export function isStarterOption(optionId: string): boolean {
  return optionId.startsWith(STARTER_PREFIX);
}

function starterOptionPick(optionId: string): StarterPick | null {
  const [, kind, id] = optionId.split(":");
  return (kind === "bot" || kind === "team") && id ? { kind, id } : null;
}

/**
 * Chief's first message for someone who answered the onboarding questions: one recommended bot or
 * team. False when the answers give no pick (or the thread already asks something), so the caller
 * keeps today's intro and focus card.
 */
export async function postStarter(
  deps: OnboardingDeps,
  actor: Actor,
  botId: string,
): Promise<boolean> {
  const survey = await deps.prisma.signupSurvey.findUnique({ where: { userId: actor.userId } });
  const pick = survey && recommendStarter(surveyAnswers(survey));
  const template = pick && starterTemplate(pick);
  if (!pick || !template) return false;
  const { bot, thread } = await requireBotThread(deps, actor, botId);
  const blocks: MessageBlock[] = [
    {
      kind: "text",
      text: `Hi, I'm ${bot.name}. Thanks for telling me about yourself. Based on your answers, here's a good place to start.`,
    },
    {
      kind: "choice",
      question: `Start with ${template.name}?`,
      subtitle: `${pick.kind === "team" ? `Team of ${template.size} bots` : "Single bot"} · ${template.summary}`,
      options: [
        { id: `${STARTER_PREFIX}${pick.kind}:${pick.id}`, letter: "A", label: "Set it up" },
        { id: STARTER_BROWSE, letter: "B", label: "Show me other templates" },
        { id: STARTER_CHAT, letter: "C", label: "Not now, just chat" },
      ],
    },
  ];
  const committed = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRaw`SELECT id FROM threads WHERE id = ${thread.id} FOR UPDATE`;
    const recent = await tx.message.findMany({
      where: { threadId: thread.id },
      select: { blocks: true },
    });
    if (recent.length) return null;
    const message = await createThreadMessageInTransaction(tx, {
      threadId: thread.id,
      role: "bot",
      markUnread: false,
      blocks,
    });
    return appendEventInTransaction(tx, {
      spaceId: actor.spaceId,
      threadId: thread.id,
      botId: bot.id,
      type: "thread.message.created",
      payload: { messageId: message.id, role: "bot", blocks },
    });
  }, THREAD_LOCK_TRANSACTION_OPTIONS);
  if (committed) await deps.events.notify(thread.id, committed.seq);
  return true;
}

function surveyAnswers(row: {
  role: string | null;
  roleDetail: string | null;
  brain: string | null;
  needs: string[];
}): Pick<SignupSurvey, "role" | "roleDetail" | "brain" | "needs"> {
  const parsed = SignupSurveySchema.safeParse({
    role: row.role ?? undefined,
    roleDetail: row.roleDetail ?? undefined,
    brain: row.brain ?? undefined,
    needs: row.needs,
  });
  return parsed.success ? parsed.data : {};
}

/**
 * Answer the starter card: set up the pick, point to the other templates, or just chat, then the
 * step for where the person's AI brain already lives. Only the first answer counts.
 */
export async function chooseStarter(
  deps: OnboardingDeps,
  actor: Actor,
  botId: string,
  optionId: string,
  options: {
    webOrigin: string;
    start: (pick: StarterPick, version: number) => Promise<void>;
  },
): Promise<void> {
  const pick = starterOptionPick(optionId);
  const template = pick && starterTemplate(pick);
  if (optionId !== STARTER_BROWSE && optionId !== STARTER_CHAT && !template) {
    throw new IsolationError();
  }
  const { bot, thread } = await requireBotThread(deps, actor, botId);
  const target = { spaceId: actor.spaceId, botId: bot.id, threadId: thread.id };
  const claimed = await answerPendingChoice(deps, target, (block) =>
    block.kind === "choice" && block.options.some((option) => option.id === optionId)
      ? { ...block, answerId: optionId }
      : block,
  );
  if (!claimed) return;

  if (pick && template) {
    await options.start(pick, template.version);
    await post(deps, target, [
      {
        kind: "text",
        text:
          pick.kind === "team"
            ? `Done. I set up **${template.name}**. Open its group chat in your list: the lead is asking its first setup question. Nothing is sent or shared without your yes.`
            : `Done. I set up **${template.name}**. Open it in your list: it's asking its first setup question. Nothing is sent or shared without your yes.`,
      },
    ]);
  } else if (optionId === STARTER_BROWSE) {
    await post(deps, target, [
      {
        kind: "text",
        text: "Tap **+** and choose **Template** to see every ready-made bot and team. Each one says what it does and how it helps.",
      },
    ]);
  } else {
    await post(deps, target, [
      { kind: "text", text: "Sure. What would you like to work on first?" },
    ]);
  }

  const survey = await deps.prisma.signupSurvey.findUnique({ where: { userId: actor.userId } });
  await postBrainStep(deps, actor, target, survey?.brain ?? null, options.webOrigin);
}

const BRAIN_APPS: Record<string, { slug: string; text: string }> = {
  drive: {
    slug: "googledrive",
    text: "You said your AI brain lives in Google Drive. Connect it so your bots can use what's already there.",
  },
  notion: {
    slug: "notion",
    text: "You said your AI brain lives in Notion. Connect it so your bots can use what's already there.",
  },
  other: {
    slug: "googledrive",
    text: "If your notes are in files or Obsidian, put them in a Google Drive folder and connect Drive here. Your bots will organize what's there instead of starting over.",
  },
};

async function postBrainStep(
  deps: OnboardingDeps,
  actor: Actor,
  target: { spaceId: string; botId: string; threadId: string },
  brain: string | null,
  webOrigin: string,
): Promise<void> {
  if (brain === "assistant") {
    const importUrl = new URL("/app?import", webOrigin).toString();
    await post(deps, target, [
      {
        kind: "text",
        text: `Bring your assistant over with [Import an agent](${importUrl}): its instructions, memory and skills come along. On your phone? Finish on the web: import works in the Wea web and desktop apps.`,
      },
    ]);
    return;
  }
  const app = brain ? BRAIN_APPS[brain] : undefined;
  if (!app) return;
  const catalog = await managedAppCatalog(deps.connectors, actor, "onboarding.brain", target.botId);
  const entry = matchAppCatalog(catalog, app.slug);
  await post(deps, target, [{ kind: "text", text: app.text }]);
  if (entry && !entry.connected) await post(deps, target, [appConnectCard(entry)]);
}
