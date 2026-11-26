import type * as Core from "@rakazo/core";
import type * as Db from "@rakazo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { gateToolCall } from "./run-tool-gate.js";
import type { ToolRequest } from "./run-tool-request.js";

const plans = vi.hoisted(() => [] as string[]);
const reviewOnly = vi.hoisted(() => [] as (boolean | undefined)[]);
vi.mock("@rakazo/core", async (importOriginal) => {
  const core = await importOriginal<typeof Core>();
  return {
    ...core,
    planActionGate: (input: Parameters<typeof core.planActionGate>[0]) => {
      const plan = core.planActionGate(input);
      plans.push(plan);
      reviewOnly.push(input.reviewOnly);
      return plan;
    },
  };
});
vi.mock("@rakazo/db", async (importOriginal) => ({
  ...(await importOriginal<typeof Db>()),
  recordAuditEvent: vi.fn(async () => {}),
}));
// Recording the effect a person answers is where an ask begins; the test stops there.
vi.mock("../lifecycle/run-effects.js", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  recordEffect: vi.fn(async () => {
    throw new Error("asks the user");
  }),
}));

const loginUse = {
  kind: "login" as const,
  login: "work",
  site: "https://login.example.test",
  title: "login.example.test",
  fields: ["Password"],
  savedAt: "2026-09-01T00:00:01.000Z",
};

function gate(options: {
  trigger?: string;
  neverAsk?: boolean;
  rule?: "always_allow" | "deny";
  asks?: boolean;
}) {
  const args = { actions: [{ kind: "fill_secret", ref: "e1", secret: "work", field: "Password" }] };
  const executionId = JSON.stringify(["pi-tool", "main", "call-1"]);
  const request: ToolRequest = {
    name: "browser_act",
    args,
    executionId,
    connectorCall: { tool: "browser_act", args, executionId, route: undefined },
    effectRequest: args,
    resolvedTool: undefined,
    catalogRemapped: false,
    nextApprovedTool: undefined,
    approvedEffectKey: undefined,
    replayEffectToolName: "browser_act",
    fleetSummary: undefined,
    heldForApproval: false,
    settingsChange: false,
    ignoresAllowRules: false,
    purchase: undefined,
    cardUse: undefined,
    loginUse: options.asks === false ? undefined : loginUse,
  };
  const ctx = {
    deps: { prisma: {} },
    run: { id: "run-1", userId: "user-1", spaceId: "space-1", trigger: options.trigger ?? "user" },
    runId: "run-1",
    bot: { id: "bot-1", name: "Helper" },
    thread: { id: "thread-1" },
    context: { signal: new AbortController().signal },
    source: { ownerStartedRun: true },
    tools: { connector: new Map(), connectedPlugins: [] },
    state: {
      tainted: false,
      effects: { consumedIds: new Set(), counts: new Map(), occurrences: [] },
    },
    trust: {
      loadApprovalRules: async () =>
        options.rule
          ? [{ effect: options.rule, matchKind: "tool", matchValue: "browser_act" }]
          : [],
      loadAutoReviewPreference: async () => ({
        enabled: false,
        skipApprovals: Boolean(options.neverAsk),
      }),
    },
  };
  return gateToolCall(ctx as never, request, undefined).then(
    (outcome) => outcome,
    (error: Error) => error.message,
  );
}

describe("gateToolCall: a login that asks first", () => {
  beforeEach(() => {
    plans.length = 0;
  });

  it("asks the user every time in Ask and Auto, even over an Always allow rule", async () => {
    for (const options of [{}, { rule: "always_allow" as const }]) {
      plans.length = 0;
      expect(await gate(options)).toBe("asks the user");
      expect(plans).toEqual(["ask"]);
    }
  });

  it("runs it without asking in Never ask", async () => {
    plans.length = 0;
    await gate({ neverAsk: true });
    expect(plans).toEqual(["allow"]);
  });

  it("asks in a webhook run too, where the card expires if nobody answers", async () => {
    plans.length = 0;
    expect(await gate({ trigger: "webhook" })).toBe("asks the user");
    expect(plans).toEqual(["ask"]);
  });

  it("is refused by a rule that blocks the tool", async () => {
    expect(await gate({ rule: "deny" })).toEqual({
      result: { error: expect.stringContaining("is blocked in this space") },
    });
  });
});

describe("gateToolCall: typing into a page after outside content, in Auto", () => {
  const typed = (
    state: { pageUrl?: string; pageUrlUncertain?: boolean },
    actions: Record<string, unknown>[] = [{ kind: "fill", ref: "e2", text: "12 Rua Nova" }],
  ) => {
    const args = { actions };
    const executionId = JSON.stringify(["pi-tool", "main", "call-1"]);
    const request = {
      name: "browser_act",
      args,
      executionId,
      connectorCall: { tool: "browser_act", args, executionId, route: undefined },
      effectRequest: args,
      replayEffectToolName: "browser_act",
      heldForApproval: false,
      settingsChange: false,
      ignoresAllowRules: false,
    } as unknown as ToolRequest;
    const ctx = {
      deps: { prisma: {}, autoReview: {} },
      run: { id: "run-1", userId: "user-1", spaceId: "space-1", trigger: "user" },
      runId: "run-1",
      bot: { id: "bot-1", name: "Helper" },
      thread: { id: "thread-1" },
      context: { signal: new AbortController().signal },
      source: { ownerStartedRun: true },
      tools: { connector: new Map(), connectedPlugins: [] },
      state: {
        ...state,
        tainted: true,
        effects: { consumedIds: new Set(), counts: new Map(), occurrences: [] },
      },
      trust: {
        searchResultUrls: new Set<string>(),
        loadTrustedSites: async () => new Set(["example.com"]),
        loadApprovalRules: async () => [],
        loadAutoReviewPreference: async () => ({ enabled: true, skipApprovals: false }),
      },
    };
    return gateToolCall(ctx as never, request, undefined).catch(() => undefined);
  };

  beforeEach(() => {
    reviewOnly.length = 0;
  });

  it("leaves typing on a site the run was given alone, and judges it once a desktop action may have moved the page", async () => {
    await typed({ pageUrl: "https://shop.example.com/address" });
    await typed({ pageUrl: "https://shop.example.com/address", pageUrlUncertain: true });
    await typed({ pageUrl: "https://forms.example.net/" });
    expect(reviewOnly).toEqual([false, true, true]);
  });

  it("judges typing after a click in the same call, which can leave the page", async () => {
    await typed({ pageUrl: "https://shop.example.com/address" }, [
      { kind: "fill", ref: "e2", text: "12 Rua Nova" },
      { kind: "click", ref: "e3" },
    ]);
    await typed({ pageUrl: "https://shop.example.com/address" }, [
      { kind: "click", ref: "e9" },
      { kind: "fill", ref: "e2", text: "12 Rua Nova" },
    ]);
    expect(reviewOnly).toEqual([false, true]);
  });
});

describe("gateToolCall: outgoing Slack and email sends", () => {
  function sendGate(options: {
    name: string;
    neverAsk?: boolean;
    auto?: boolean;
    rule?: "always_allow" | "deny";
    args?: Record<string, unknown>;
    batch?: { tools: { tool_slug: string; arguments: Record<string, unknown> }[] };
  }) {
    const args = options.batch ?? options.args ?? { channel: "C1", text: "Hello" };
    const executionId = JSON.stringify(["pi-tool", "main", "call-1"]);
    const request: ToolRequest = {
      name: options.name,
      args,
      executionId,
      connectorCall: { tool: options.name, args, executionId, route: undefined },
      effectRequest: args,
      resolvedTool: undefined,
      catalogRemapped: false,
      nextApprovedTool: undefined,
      approvedEffectKey: undefined,
      replayEffectToolName: options.name,
      fleetSummary: undefined,
      heldForApproval: false,
      settingsChange: false,
      ignoresAllowRules: false,
      purchase: undefined,
      cardUse: undefined,
      loginUse: undefined,
    };
    const connectorTool = options.batch
      ? {
          name: options.name,
          description: options.name,
          inputSchema: { type: "object", properties: {} },
          batch: { items: "tools", action: "tool_slug", arguments: "arguments" },
        }
      : {
          name: options.name,
          description: options.name,
          inputSchema: { type: "object", properties: {} },
        };
    const ctx = {
      deps: { prisma: {}, autoReview: {} },
      run: { id: "run-1", userId: "user-1", spaceId: "space-1", trigger: "user" },
      runId: "run-1",
      bot: { id: "bot-1", name: "Helper" },
      thread: { id: "thread-1" },
      context: { signal: new AbortController().signal },
      source: { ownerStartedRun: true },
      tools: { connector: new Map([[options.name, connectorTool]]), connectedPlugins: [] },
      state: {
        tainted: false,
        effects: { consumedIds: new Set(), counts: new Map(), occurrences: [] },
      },
      trust: {
        loadApprovalRules: async () =>
          options.rule
            ? [{ effect: options.rule, matchKind: "tool", matchValue: options.name }]
            : [],
        loadAutoReviewPreference: async () => ({
          enabled: options.neverAsk ? false : (options.auto ?? true),
          skipApprovals: Boolean(options.neverAsk),
        }),
      },
    };
    return gateToolCall(ctx as never, request, undefined).then(
      (outcome) => outcome,
      (error: Error) => error.message,
    );
  }

  beforeEach(() => {
    plans.length = 0;
  });

  it("holds Slack and email sends for a person in Auto, even over an Always allow rule", async () => {
    for (const options of [
      { name: "SLACK_SEND_MESSAGE" },
      {
        name: "GMAIL_SEND_EMAIL",
        args: { recipient_email: "a@example.test", subject: "Hi", body: "Hello" },
      },
      { name: "send_email", args: { to: "a@example.test", subject: "Hi", body: "Hello" } },
      { name: "OUTLOOK_SEND_EMAIL", args: { to: "a@example.test", body: "Hello" } },
      {
        name: "SLACK_SEND_MESSAGE",
        rule: "always_allow" as const,
      },
      {
        name: "COMPOSIO_MULTI_EXECUTE_TOOL",
        batch: {
          tools: [{ tool_slug: "SLACK_SEND_MESSAGE", arguments: { channel: "C1", text: "Hello" } }],
        },
      },
    ]) {
      plans.length = 0;
      expect(await sendGate(options)).toBe("asks the user");
      expect(plans).toEqual(["ask"]);
    }
  });

  it("runs those sends without asking in Never ask", async () => {
    await sendGate({ name: "SLACK_SEND_MESSAGE", neverAsk: true });
    await sendGate({
      name: "GMAIL_SEND_EMAIL",
      neverAsk: true,
      args: { recipient_email: "a@example.test", subject: "Hi", body: "Hello" },
    });
    expect(plans).toEqual(["allow", "allow"]);
  });

  it("still judges other connector writes in Auto, and does not hold a Slack read", async () => {
    await sendGate({ name: "GITHUB_CREATE_ISSUE", args: { title: "Notes" } });
    expect(plans).toEqual(["judge"]);
    plans.length = 0;
    const listed = await sendGate({ name: "SLACK_LIST_CHANNELS", args: {} });
    expect(plans).not.toContain("ask");
    expect(listed).not.toBe("asks the user");
  });
});
