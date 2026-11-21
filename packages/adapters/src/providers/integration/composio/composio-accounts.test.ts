import { describe, expect, it } from "vitest";
import type { ComposioAccountRef } from "./composio-accounts.js";
import {
  accountsForTool,
  composioAccountsHint,
  resolveCallAccounts,
  resolveComposioAccount,
} from "./composio-accounts.js";

const refs: ComposioAccountRef[] = [
  { toolkit: "SLACK", id: "ca_a", wordId: "slack_tala-cancel", names: ["weassist"] },
  { toolkit: "SLACK", id: "ca_b", wordId: "slack_nappy-lim", names: ["workstackos"] },
  { toolkit: "GMAIL", id: "ca_c", wordId: "gmail_funje-nowed", alias: "eric", names: ["Eric"] },
  { toolkit: "GMAIL", id: "ca_d", wordId: "gmail_agist-social", names: ["Support"] },
];

describe("composio account names", () => {
  it("scopes candidates to the tool's toolkit", () => {
    expect(accountsForTool("SLACK_FETCH_CONVERSATION_HISTORY", refs).map((r) => r.id)).toEqual([
      "ca_a",
      "ca_b",
    ]);
    expect(accountsForTool("GITHUB_GET_REPOS", refs)).toEqual([]);
  });

  it.each([
    ["workstackos", "ca_b"],
    [" WORKSTACKOS ", "ca_b"],
    ["slack_nappy-lim", "ca_b"],
    ["ca_b", "ca_b"],
    ["sla…-cancel", "ca_a"],
  ])("resolves %s", (value, id) => {
    expect(resolveComposioAccount(value, accountsForTool("SLACK_X", refs))).toEqual({ id });
  });

  it("resolves a Gmail alias and plugin name alike", () => {
    const gmail = accountsForTool("GMAIL_FETCH_EMAILS", refs);
    expect(resolveComposioAccount("eric", gmail)).toEqual({ id: "ca_c" });
    expect(resolveComposioAccount("support", gmail)).toEqual({ id: "ca_d" });
  });

  it("refuses an ambiguous shortened id", () => {
    expect(resolveComposioAccount("slack…", accountsForTool("SLACK_X", refs))).toEqual({
      error: expect.stringContaining('Pass one of: "weassist" (slack_tala-cancel)'),
    });
  });

  it("passes a value through when nothing is known to resolve it against", () => {
    expect(resolveComposioAccount("anything", [])).toBeUndefined();
    expect(resolveCallAccounts("GITHUB_GET_REPOS", {}, "ca-x", refs)).toEqual({
      args: {},
      account: "ca-x",
    });
  });

  it("rewrites each nested multi-execute account and keeps unnamed items", () => {
    const result = resolveCallAccounts(
      "COMPOSIO_MULTI_EXECUTE_TOOL",
      {
        tools: [
          { tool_slug: "SLACK_LIST_CHANNELS", arguments: {}, account: "weassist" },
          { tool_slug: "GMAIL_FETCH_EMAILS", arguments: {}, account: "Support" },
          { tool_slug: "SLACK_LIST_CHANNELS", arguments: {} },
        ],
      },
      undefined,
      refs,
    );
    expect(result).toEqual({
      args: {
        tools: [
          { tool_slug: "SLACK_LIST_CHANNELS", arguments: {}, account: "ca_a" },
          { tool_slug: "GMAIL_FETCH_EMAILS", arguments: {}, account: "ca_d" },
          { tool_slug: "SLACK_LIST_CHANNELS", arguments: {} },
        ],
      },
    });
  });

  it("describes only toolkits with more than one account", () => {
    expect(composioAccountsHint(refs.slice(0, 3))).toBe(
      [
        "Connected accounts (set `account` on each tool to any name or id shown; without it the default account is used):",
        '- SLACK: "weassist" (slack_tala-cancel), "workstackos" (slack_nappy-lim)',
      ].join("\n"),
    );
    expect(composioAccountsHint(refs.slice(0, 1))).toBeUndefined();
  });
});
