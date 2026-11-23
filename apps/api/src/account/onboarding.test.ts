import type * as db from "@rakazo/db";
import { appendEventInTransaction } from "@rakazo/db";
import { describe, expect, it, vi } from "vitest";
import {
  chooseFocus,
  chooseStarter,
  dismissFocus,
  markAppConnected,
  postStarter,
  promptFocus,
} from "./onboarding.js";

const posted = vi.hoisted(() => [] as Array<{ blocks: unknown[]; markUnread?: boolean }>);
vi.mock("@rakazo/db", async (original) => ({
  ...(await original<typeof db>()),
  createThreadMessageInTransaction: vi.fn(async (_tx, input) => {
    posted.push(input);
    return { id: "posted" };
  }),
  appendEventInTransaction: vi.fn(async () => ({ seq: 1 })),
}));
// These transactions lock the thread row, which snapshot reads hold for up to 15s.
const budget = { timeout: 20_000 };
function fixture(catalog: unknown[]) {
  posted.length = 0;
  const tx = {
    $executeRaw: vi.fn(),
    message: {
      findMany: vi.fn(async () => [{ id: "choice", blocks: [{ kind: "choice", answerId: null }] }]),
      update: vi.fn(),
    },
  };
  const deps = {
    prisma: {
      bot: { findFirst: vi.fn(async () => ({ id: "bot", thread: { id: "thread" } })) },
      $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(tx)),
    },
    events: { notify: vi.fn() },
    connectors: {
      defaultConnectorId: "first-connector",
      managedProviders: () => [{ catalog: async () => catalog }],
      managed: vi.fn(() => ({ catalog: async () => catalog })),
    },
  } as unknown as Parameters<typeof chooseFocus>[0];
  const actor = {
    userId: "user",
    spaceId: "space",
    email: "user@rakazo.test",
    isDeploymentOwner: true,
  };
  return { deps, actor, tx };
}
describe("onboarding connection suggestions", () => {
  it("does not invent authorization cards when no connector has an app catalog", async () => {
    const { deps, actor } = fixture([]);
    await chooseFocus(deps, actor, "bot", "day");
    expect(posted.flatMap((message) => message.blocks)).not.toContainEqual(
      expect.objectContaining({ kind: "app_connect" }),
    );
    expect(posted.length).toBeGreaterThan(0);
    // The reply to the user's pick is read; suggestions after the catalog wait stay unread.
    expect(posted[0]?.markUnread).toBe(false);
    expect(posted.slice(1).every((message) => message.markUnread === true)).toBe(true);
    expect(deps.prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), budget);
  });
  it("uses the available connector and omits unavailable apps", async () => {
    const { deps, actor } = fixture([
      { connectorId: "pipedream", slug: "slack", name: "Slack", connected: false, logo: null },
    ]);
    await chooseFocus(deps, actor, "bot", "day");
    expect(
      posted
        .flatMap((message) => message.blocks)
        .filter((block) => (block as { kind: string }).kind === "app_connect"),
    ).toEqual([
      expect.objectContaining({ connectorId: "pipedream", provider: "slack", name: "Slack" }),
    ]);
  });
});

describe("promptFocus", () => {
  function focusFixture(options: { introRun?: boolean; blocks?: unknown[] } = {}) {
    const { deps, actor, tx } = fixture([]);
    tx.message.findMany = vi.fn(async () =>
      options.blocks ? [{ role: "bot", blocks: options.blocks }] : [],
    ) as never;
    const run = {
      findFirst: vi.fn(async () => (options.introRun ? { id: "intro" } : null)),
    };
    Object.assign(tx, { run });
    return { deps, actor, run };
  }

  it("posts the fixed focus card when the bot has no creation intro", async () => {
    const { deps, actor } = focusFixture();
    await promptFocus(deps, actor, "bot");
    expect(posted.flatMap((message) => message.blocks)).toContainEqual(
      expect.objectContaining({ kind: "choice" }),
    );
    expect(deps.prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), budget);
  });

  it("leaves the question to a bot whose creation intro is queued or running", async () => {
    const { deps, actor, run } = focusFixture({ introRun: true });
    await promptFocus(deps, actor, "bot");
    expect(posted).toEqual([]);
    expect(run.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ threadId: "thread", trigger: "created" }),
      }),
    );
  });

  it("does not post over a question the bot already asked", async () => {
    const { deps, actor } = focusFixture({
      blocks: [{ kind: "ask", text: "What do you want me for?", status: "answered" }],
    });
    await promptFocus(deps, actor, "bot");
    expect(posted).toEqual([]);
  });
});

it("marks only the authorized connector when provider slugs collide", async () => {
  const { deps, actor, tx } = fixture([
    { connectorId: "pipedream", slug: "slack", name: "Slack", connected: true },
  ]);
  const blocks = ["composio", "pipedream"].map((connectorId) => ({
    kind: "app_connect",
    connectorId,
    provider: "slack",
    name: "Slack",
    status: "pending",
  }));
  tx.message.findMany = vi.fn(async () => [{ id: "cards", blocks }]) as never;
  await markAppConnected(deps, actor, "bot", "slack", "pipedream");
  expect(tx.message.update).toHaveBeenCalledWith({
    where: { id: "cards" },
    data: { blocks: [blocks[0], { ...blocks[1], status: "connected" }] },
  });
  expect(deps.prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), budget);
});

it("reads a request and a stored card that name no connector as the server's default", async () => {
  const { deps, actor, tx } = fixture([
    { connectorId: "first-connector", slug: "slack", name: "Slack", connected: true },
  ]);
  const card = { kind: "app_connect", provider: "slack", name: "Slack", status: "pending" };
  const other = { ...card, connectorId: "pipedream" };
  tx.message.findMany = vi.fn(async () => [{ id: "cards", blocks: [card, other] }]) as never;
  await markAppConnected(deps, actor, "bot", "slack", undefined);
  expect(deps.connectors.managed).toHaveBeenCalledWith("first-connector");
  expect(tx.message.update).toHaveBeenCalledWith({
    where: { id: "cards" },
    data: { blocks: [{ ...card, status: "connected" }, other] },
  });
});

it("dismisses the pending focus card under the thread-lock budget", async () => {
  const { deps, actor, tx } = fixture([]);
  await dismissFocus(deps, actor, "bot");
  expect(tx.message.update).toHaveBeenCalledWith({
    where: { id: "choice" },
    data: { blocks: [{ kind: "choice", answerId: expect.any(String) }] },
  });
  expect(deps.prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), budget);
});

it("does not trust a client's connected claim", async () => {
  const { deps, actor, tx } = fixture([
    { connectorId: "pipedream", slug: "slack", connected: false },
  ]);
  Object.assign(deps.prisma, { message: { findMany: vi.fn() } });
  await markAppConnected(deps, actor, "bot", "slack", "pipedream", "thread");
  expect(deps.prisma.message.findMany).not.toHaveBeenCalled();
  expect(tx.message.update).not.toHaveBeenCalled();
});

it("rejects a thread from another user or space before reading its messages", async () => {
  const { deps, actor, tx } = fixture([
    { connectorId: "pipedream", slug: "slack", connected: true },
  ]);
  Object.assign(deps.prisma, { thread: { findFirst: vi.fn(async () => null) } });
  await expect(
    markAppConnected(deps, actor, "bot", "slack", "pipedream", "other-thread"),
  ).rejects.toThrow();
  expect(deps.prisma.thread.findFirst).toHaveBeenCalledWith({
    where: { id: "other-thread", spaceId: actor.spaceId },
  });
  expect(tx.message.update).not.toHaveBeenCalled();
});

it("updates an accessible group thread and emits its normal update event", async () => {
  const { deps, actor, tx } = fixture([
    { connectorId: "pipedream", slug: "slack", connected: true },
  ]);
  Object.assign(deps.prisma, {
    thread: {
      findFirst: vi.fn(async () => ({ id: "group-thread", groupId: "group" })),
    },
  });
  Object.assign(deps.prisma, {
    chatGroup: {
      findFirst: vi.fn(async () => ({
        id: "group",
        name: "Team",
        thread: { id: "group-thread" },
        members: ["bot", "peer"].map((id) => ({ bot: { id, name: id, runs: [] } })),
      })),
    },
  });
  tx.message.findMany = vi.fn(async () => [
    {
      id: "card",
      blocks: [
        { kind: "app_connect", connectorId: "pipedream", provider: "slack", status: "pending" },
      ],
    },
  ]) as never;
  await markAppConnected(deps, actor, "bot", "slack", "pipedream", "group-thread");
  expect(deps.prisma.chatGroup.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: "group", spaceId: actor.spaceId, archivedAt: null },
    }),
  );
  expect(tx.message.findMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { threadId: "group-thread" } }),
  );
  expect(tx.message.update).toHaveBeenCalledWith({
    where: { id: "card" },
    data: { blocks: [expect.objectContaining({ status: "connected" })] },
  });
  expect(appendEventInTransaction).toHaveBeenCalledWith(
    tx,
    expect.objectContaining({
      threadId: "group-thread",
      spaceId: actor.spaceId,
      type: "thread.message.updated",
    }),
  );
  expect(deps.events.notify).toHaveBeenCalledWith("group-thread", 1);
});

it("rejects a group the space does not have", async () => {
  const { deps, actor, tx } = fixture([
    { connectorId: "pipedream", slug: "slack", connected: true },
  ]);
  Object.assign(deps.prisma, {
    thread: {
      findFirst: vi.fn(async () => ({ id: "other-thread", groupId: "other-group" })),
    },
  });
  Object.assign(deps.prisma, { chatGroup: { findFirst: vi.fn(async () => null) } });
  await expect(
    markAppConnected(deps, actor, "bot", "slack", "pipedream", "other-thread"),
  ).rejects.toThrow();
  expect(tx.message.update).not.toHaveBeenCalled();
  expect(deps.prisma.bot.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({ where: { id: "bot", spaceId: actor.spaceId } }),
  );
});

it("updates the authorized card's own message even outside the bounded scan", async () => {
  const { deps, actor, tx } = fixture([
    { connectorId: "pipedream", slug: "slack", name: "Slack", connected: true },
  ]);
  const card = {
    kind: "app_connect",
    connectorId: "pipedream",
    provider: "slack",
    name: "Slack",
    status: "pending",
  };
  tx.message.findMany = vi.fn(async ({ where }: { where: { id?: string; threadId: string } }) =>
    where.id === "middle" && where.threadId === "thread" ? [{ id: "middle", blocks: [card] }] : [],
  ) as never;
  await markAppConnected(deps, actor, "bot", "slack", "pipedream", "thread", "middle");
  expect(tx.message.findMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { id: "middle", threadId: "thread" } }),
  );
  expect(tx.message.update).toHaveBeenCalledWith({
    where: { id: "middle" },
    data: { blocks: [{ ...card, status: "connected" }] },
  });
});

describe("Wea starter pick", () => {
  function starterFixture(survey: Record<string, unknown> | null, catalog: unknown[] = []) {
    const { deps, actor, tx } = fixture(catalog);
    Object.assign(deps.prisma, {
      signupSurvey: { findUnique: vi.fn(async () => survey) },
      bot: {
        findFirst: vi.fn(async () => ({ id: "bot", name: "Chief", thread: { id: "thread" } })),
      },
    });
    return { deps, actor, tx };
  }
  const answered = (blocks: unknown[]) => [{ id: "starter", blocks }];
  const blocks = () =>
    posted.flatMap((message) => message.blocks) as Array<Record<string, unknown>>;

  it("keeps today's opening when the questions were skipped", async () => {
    const { deps, actor } = starterFixture({
      role: null,
      roleDetail: null,
      brain: null,
      needs: [],
    });
    await expect(postStarter(deps, actor, "bot")).resolves.toBe(false);
    expect(posted).toEqual([]);
  });

  it("offers the one recommended team on an empty thread", async () => {
    const { deps, actor, tx } = starterFixture({
      role: "va",
      roleDetail: "many_clients",
      brain: "none",
      needs: [],
    });
    tx.message.findMany = vi.fn(async () => []) as never;
    await expect(postStarter(deps, actor, "bot")).resolves.toBe(true);
    expect(blocks()).toContainEqual(
      expect.objectContaining({
        kind: "choice",
        question: "Start with VA back office?",
        subtitle: expect.stringContaining("Team of 5 bots"),
        options: [
          expect.objectContaining({ id: "starter:team:va-back-office", label: "Set it up" }),
          expect.objectContaining({ id: "starter:browse" }),
          expect.objectContaining({ id: "starter:chat" }),
        ],
      }),
    );
  });

  it("sets up the pick once, then offers to connect the Drive brain", async () => {
    const { deps, actor, tx } = starterFixture({ brain: "drive" }, [
      { connectorId: "composio", slug: "googledrive", name: "Google Drive", connected: false },
    ]);
    tx.message.findMany = vi.fn(async () =>
      answered([{ kind: "choice", options: [{ id: "starter:bot:ai-brain-keeper" }] }]),
    ) as never;
    const start = vi.fn(async () => undefined);
    await chooseStarter(deps, actor, "bot", "starter:bot:ai-brain-keeper", {
      webOrigin: "https://wea.weassist.io",
      start,
    });
    expect(start).toHaveBeenCalledWith({ kind: "bot", id: "ai-brain-keeper" }, expect.any(Number));
    expect(blocks()).toContainEqual(
      expect.objectContaining({ kind: "app_connect", provider: "googledrive" }),
    );
    // An already answered card is not set up twice.
    tx.message.findMany = vi.fn(async () => []) as never;
    await chooseStarter(deps, actor, "bot", "starter:bot:ai-brain-keeper", {
      webOrigin: "https://wea.weassist.io",
      start,
    });
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("points an assistant's brain to Import an agent, finished on the web from a phone", async () => {
    const { deps, actor, tx } = starterFixture({ brain: "assistant" });
    tx.message.findMany = vi.fn(async () =>
      answered([{ kind: "choice", options: [{ id: "starter:chat" }] }]),
    ) as never;
    const start = vi.fn();
    await chooseStarter(deps, actor, "bot", "starter:chat", {
      webOrigin: "https://wea.weassist.io",
      start,
    });
    expect(start).not.toHaveBeenCalled();
    const text = blocks()
      .map((block) => block.text)
      .join("\n");
    expect(text).toContain("[Import an agent](https://wea.weassist.io/app?import)");
    expect(text).toContain("Finish on the web");
  });

  it("refuses a pick that is no template", async () => {
    const { deps, actor } = starterFixture(null);
    await expect(
      chooseStarter(deps, actor, "bot", "starter:bot:inbox-nope", {
        webOrigin: "https://wea.weassist.io",
        start: vi.fn(),
      }),
    ).rejects.toThrow();
  });
});
