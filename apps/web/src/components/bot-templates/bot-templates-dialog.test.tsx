// @vitest-environment jsdom
import type { Bot, BotTemplateListing } from "@rakazo/contracts";
import { BOT_TEMPLATE_CHANGED } from "@rakazo/contracts";
import { deferred } from "@rakazo/core/test-async";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import type { ComponentProps, ReactNode } from "react";
import { act } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const bots = vi.hoisted(() => ({
  templates: vi.fn(),
  teamTemplates: vi.fn(),
  createTeamFromTemplate: vi.fn(),
  createFromTemplate: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
}));
vi.mock("../../lib/query/rpc", () => {
  const rpc = { bots, connections: { catalog: vi.fn(async () => []) } };
  return { rpc, rpcForSpace: () => rpc, createSpaceRpc: () => rpc, selectedSpaceId: () => null };
});
vi.mock("@lingui/react/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  useLingui: () => ({
    t: (parts: TemplateStringsArray, ...values: unknown[]) => String.raw(parts, ...values),
    i18n: { locale: "en" },
  }),
}));
vi.mock("@rakazo/chat-ui/web", () => ({
  ChatMarkdown: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@rakazo/ui-web", () => {
  const Box = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    Button: ({
      variant: _variant,
      size: _size,
      ...props
    }: ComponentProps<"button"> & { variant?: string; size?: string }) => (
      <button type="button" {...props} />
    ),
    Dialog: Box,
    DialogClose: () => null,
    DialogContent: Box,
    DialogHeader: Box,
    DialogTitle: Box,
    SectionHeading: Box,
    Spinner: () => <span role="status" />,
    Badge: ({ children, ...props }: ComponentProps<"span"> & { variant?: string }) => (
      <span {...props}>{children}</span>
    ),
  };
});
vi.mock("../integrations/plugin-marketplace", () => ({ PluginLogo: () => null, ROW_HOVER: "" }));

import { useSpaceQueries } from "../../lib/query/query";
import { BotTemplatesDialog } from "./bot-templates-dialog";

const template: BotTemplateListing = {
  id: "weekly-digest",
  version: 3,
  name: "Weekly digest",
  category: "productivity",
  summary: "A summary every Friday",
  sample: "**Friday**",
  whatItDoes: [
    "Writes a Friday digest.",
    "Lists the week's work.",
    "Flags anything waiting on you.",
  ],
  howItHelps: [
    "You start Friday knowing what happened.",
    "Nothing important is left out.",
    "The digest stays a draft until you send it.",
  ],
  description: "",
  instructions: "Summarize the week.",
  skills: [],
  routines: [],
  apps: [],
  botId: null,
};
const made = { id: "bot-new", name: "Weekly digest" } as Bot;

/** Another screen that lists the space's bots. */
function Roster() {
  useQuery(useSpaceQueries().bots.list.queryOptions());
  return null;
}

const onOpenBot = vi.fn();
let container: HTMLDivElement;
let root: Root;
async function render(listed: BotTemplateListing = template) {
  bots.templates.mockResolvedValue([listed]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const tree = (open: boolean) => (
    <QueryClientProvider client={client}>
      <Roster />
      {open ? <BotTemplatesDialog onClose={() => undefined} onOpenBot={onOpenBot} /> : null}
    </QueryClientProvider>
  );
  await act(async () => root.render(tree(true)));
  await vi.waitFor(() =>
    expect(container.querySelector('[data-testid="bot-template-card"]')).toBeTruthy(),
  );
  await act(async () =>
    container.querySelector<HTMLButtonElement>('[data-testid="bot-template-card"]')!.click(),
  );
  return { close: () => act(async () => root.render(tree(false))) };
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  for (const call of Object.values(bots)) call.mockReset();
  bots.list.mockResolvedValue([]);
  bots.teamTemplates.mockResolvedValue([]);
  onOpenBot.mockReset();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function button(name: string) {
  return [...container.querySelectorAll("button")].find(
    (node) => node.textContent?.trim() === name,
  );
}
const back = () => container.querySelector<HTMLButtonElement>('button[aria-label="Back"]');
const alert = () => container.querySelector('[role="alert"]')?.textContent;

it("creates one bot, holds the page meanwhile, reads the bots again, then opens it and stays held", async () => {
  const creating = deferred<{ bot: Bot; created: boolean }>();
  bots.createFromTemplate.mockReturnValue(creating.promise);
  await render();
  await act(async () => {
    button("Create bot")?.click();
    button("Create bot")?.click();
  });
  expect(bots.createFromTemplate.mock.calls).toEqual([
    [{ templateId: "weekly-digest", version: 3, name: "Weekly digest" }],
  ]);
  expect(button("Creating…")?.disabled).toBe(true);
  expect(back()?.disabled).toBe(true);
  expect(onOpenBot).not.toHaveBeenCalled();

  await act(async () => creating.resolve({ bot: made, created: true }));
  await vi.waitFor(() => expect(onOpenBot).toHaveBeenCalledWith(made));
  expect(bots.list).toHaveBeenCalledTimes(2);
  expect(button("Creating…")?.disabled).toBe(true);
});

it("says why the bot was not created and offers the page again", async () => {
  bots.createFromTemplate.mockRejectedValue({ code: "INTERNAL_SERVER_ERROR" });
  await render();
  await act(async () => button("Create bot")?.click());
  expect(alert()).toBe("Could not create the bot");
  expect(button("Create bot")?.disabled).toBe(false);
  expect(back()?.disabled).toBe(false);
  expect(onOpenBot).not.toHaveBeenCalled();
  expect(bots.list).toHaveBeenCalledTimes(1);
});

it("reads the templates again when the one shown has changed", async () => {
  bots.createFromTemplate.mockRejectedValue({ data: { reason: BOT_TEMPLATE_CHANGED } });
  await render();
  await act(async () => button("Create bot")?.click());
  expect(alert()).toBe("This template was just updated. Check it again.");
  expect(bots.templates).toHaveBeenCalledTimes(2);
});

it("opens the bot a template already made, and says when it cannot", async () => {
  bots.get.mockRejectedValueOnce({ code: "INTERNAL_SERVER_ERROR" }).mockResolvedValue(made);
  await render({ ...template, botId: "bot-new" });
  await act(async () => button("Open")?.click());
  expect(alert()).toBe("Could not open the bot");
  expect(button("Open")?.disabled).toBe(false);

  await act(async () => button("Open")?.click());
  expect(bots.get).toHaveBeenLastCalledWith({ botId: "bot-new" });
  expect(onOpenBot).toHaveBeenCalledWith(made);
});

it("does not open a bot that arrives after the templates were closed", async () => {
  const creating = deferred<{ bot: Bot; created: boolean }>();
  bots.createFromTemplate.mockReturnValue(creating.promise);
  const dialog = await render();
  await act(async () => button("Create bot")?.click());
  await dialog.close();
  await act(async () => creating.resolve({ bot: made, created: true }));
  expect(onOpenBot).not.toHaveBeenCalled();
  // The roster still on screen lists the new bot.
  await vi.waitFor(() => expect(bots.list).toHaveBeenCalledTimes(2));
});

it("filters the templates by category, with All showing every one", async () => {
  bots.templates.mockResolvedValue([
    template,
    { ...template, id: "cash-check", name: "Cash check", category: "accounting-finance" },
    { ...template, id: "close-list", name: "Close list", category: "accounting-finance" },
  ]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <BotTemplatesDialog onClose={() => undefined} onOpenBot={onOpenBot} />
      </QueryClientProvider>,
    ),
  );
  const cards = () =>
    [...container.querySelectorAll('[data-testid="bot-template-card"]')].map(
      (card) => card.textContent,
    );
  await vi.waitFor(() => expect(cards()).toHaveLength(3));
  const chips = () =>
    [...container.querySelectorAll('[data-testid="bot-template-categories"] button')].map(
      (chip) => [chip.textContent, chip.getAttribute("aria-pressed")],
    );
  // Categories follow the page's order and only appear when they have templates.
  expect(chips()).toEqual([
    ["All", "true"],
    ["Accounting & finance", "false"],
    ["Productivity", "false"],
  ]);

  // The chips sit outside the scrolling list, and a new filter starts the list at its top.
  const scroll = container.querySelector<HTMLElement>('[data-testid="bot-template-scroll"]')!;
  expect(scroll.querySelector('[data-testid="bot-template-categories"]')).toBeNull();
  scroll.scrollTop = 400;
  await act(async () => button("Accounting & finance")?.click());
  expect(scroll.scrollTop).toBe(0);
  expect(cards()).toHaveLength(2);
  expect(cards().every((text) => text?.includes("Weekly digest") === false)).toBe(true);
  expect(chips()[1]).toEqual(["Accounting & finance", "true"]);

  await act(async () => button("All")?.click());
  expect(cards()).toHaveLength(3);
});

it("lists teams under Teams, and creating one opens its group chat", async () => {
  const team = {
    id: "finance-team",
    version: 2,
    name: "Finance team",
    summary: "Close the books together",
    sample: "**Finance**",
    whatItDoes: [
      "Sorts receipts together.",
      "Drafts invoice reminders.",
      "Runs the month-end checklist.",
    ],
    howItHelps: [
      "The books stay in motion all month.",
      "You review drafts instead of building them.",
      "Nothing is marked final until you approve it.",
    ],
    lead: "weekly-digest",
    members: [
      { templateId: "weekly-digest", role: "Leads.", name: "Weekly digest", botId: null },
      { templateId: "cash-check", role: "Watches cash.", name: "Cash check", botId: "bot-cash" },
    ],
    groupId: null,
    successMetric: { name: "Days to close", measure: "Business days until the books close." },
    weekOne: ["Day 1: ask for the checklist", "Day 2: sort receipts", "Day 3: practice close"],
    wontDo: ["Move money", "Send without a yes", "Store card numbers"],
    approvals: ["Each reminder", "The close packet"],
    setupInputs: [
      { name: "Close checklist", detail: "Your month-end steps." },
      { name: "Accounting tool", detail: "The tool you use." },
      { name: "Reviewer", detail: "Who reviews the close." },
    ],
  };
  const group = { id: "group-1", name: "Finance team" };
  bots.templates.mockResolvedValue([
    template,
    { ...template, id: "cash-check", name: "Cash check", category: "accounting-finance" },
  ]);
  bots.teamTemplates.mockResolvedValue([team]);
  bots.createTeamFromTemplate.mockResolvedValue({ group, members: [], created: true });
  const onOpenGroup = vi.fn();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <BotTemplatesDialog
          onClose={() => undefined}
          onOpenBot={onOpenBot}
          onOpenGroup={onOpenGroup}
        />
      </QueryClientProvider>,
    ),
  );
  await vi.waitFor(() => expect(button("Teams")).toBeTruthy());
  await act(async () => button("Teams")?.click());
  const card = container.querySelector<HTMLButtonElement>('[data-testid="team-template-card"]')!;
  expect(card.textContent).toContain("Finance team");
  expect(card.textContent).toContain("Weekly digest · Lead");
  expect(card.querySelector('[data-testid="template-kind-badge"]')?.textContent).toBe(
    "Team · 2 bots",
  );
  expect(container.querySelector('[data-testid="bot-template-card"]')).toBeNull();

  await act(async () => card.click());
  const detail = container.querySelector('[data-testid="team-template-detail"]')!;
  expect(detail.querySelector('[data-testid="template-kind-badge"]')?.textContent).toBe(
    "Team · 2 bots",
  );
  expect(detail.querySelector('[data-testid="template-what-it-does"]')?.textContent).toContain(
    "Keeps receipts, invoices, cash, expense reports, and the month-end close in one rhythm",
  );
  expect(detail.querySelector('[data-testid="template-how-it-helps"]')?.textContent).toContain(
    "You review lists and drafts instead of building them from scratch",
  );
  expect(detail.textContent).not.toContain("**Finance**");
  expect(detail.textContent).toContain("Watches cash.");
  expect(detail.textContent).toContain("Your existing bot joins the team");
  const section = (id: string) => detail.querySelector(`[data-testid="${id}"]`)?.textContent ?? "";
  expect(section("team-success-metric")).toContain("Days to close");
  expect(section("team-success-metric")).toContain("Business days until the books close.");
  expect(section("team-setup-inputs")).toContain("Close checklistYour month-end steps.");
  expect(section("team-setup-inputs")).toContain("in its first chat");
  expect(section("team-week-one")).toContain("3.Day 3: practice close");
  expect(section("team-approvals")).toContain("The close packet");
  expect(section("team-wont-do")).toContain("Move money");
  await act(async () => button("Create team")?.click());
  expect(bots.createTeamFromTemplate).toHaveBeenCalledWith({ teamId: "finance-team", version: 2 });
  await vi.waitFor(() => expect(onOpenGroup).toHaveBeenCalledWith(group));
});

it("labels each card and page as a single bot or a team, and All lists both", async () => {
  const team = {
    id: "finance-team",
    version: 2,
    name: "Finance team",
    summary: "Close the books together",
    sample: "**Finance**",
    whatItDoes: [
      "Sorts receipts together.",
      "Drafts invoice reminders.",
      "Runs the month-end checklist.",
    ],
    howItHelps: [
      "The books stay in motion all month.",
      "You review drafts instead of building them.",
      "Nothing is marked final until you approve it.",
    ],
    lead: "weekly-digest",
    members: [
      { templateId: "weekly-digest", role: "Leads.", name: "Weekly digest", botId: null },
      { templateId: "cash-check", role: "Watches cash.", name: "Cash check", botId: null },
    ],
    groupId: null,
    successMetric: { name: "Days to close", measure: "Business days until the books close." },
    weekOne: ["Day 1"],
    wontDo: ["Move money"],
    approvals: ["The close packet"],
    setupInputs: [{ name: "Close checklist", detail: "Your month-end steps." }],
  };
  bots.templates.mockResolvedValue([
    template,
    { ...template, id: "cash-check", name: "Cash check", category: "accounting-finance" },
  ]);
  bots.teamTemplates.mockResolvedValue([team]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <BotTemplatesDialog onClose={() => undefined} onOpenBot={onOpenBot} onOpenGroup={vi.fn()} />
      </QueryClientProvider>,
    ),
  );
  await vi.waitFor(() => expect(button("Teams")).toBeTruthy());
  const kind = (rootEl: Element | null) =>
    rootEl?.querySelector('[data-testid="template-kind-badge"]')?.textContent;
  const single = container.querySelector('[data-testid="bot-template-card"]');
  const fleet = container.querySelector('[data-testid="team-template-card"]');
  expect(kind(single)).toBe("Single bot");
  expect(kind(fleet)).toBe("Team · 2 bots");

  await act(async () =>
    container.querySelector<HTMLButtonElement>('[data-testid="bot-template-card"]')!.click(),
  );
  const singleDetail = container.querySelector('[data-testid="bot-template-detail"]');
  expect(kind(singleDetail)).toBe("Single bot");
  expect(
    singleDetail?.querySelector('[data-testid="template-what-it-does"]')?.textContent,
  ).toContain("Writes a Friday digest.");
  expect(
    singleDetail?.querySelector('[data-testid="template-how-it-helps"]')?.textContent,
  ).toContain("You start Friday knowing what happened.");
  expect(singleDetail?.textContent ?? "").not.toContain("**Friday**");
  await act(async () => back()?.click());
  await act(async () => button("Accounting & finance")?.click());
  expect(container.querySelector('[data-testid="team-template-card"]')).toBeNull();
  expect(container.querySelectorAll('[data-testid="bot-template-card"]')).toHaveLength(1);
});

it("hides Teams when the dialog can't open a group", async () => {
  bots.teamTemplates.mockResolvedValue([{ id: "finance-team" }]);
  bots.templates.mockResolvedValue([
    template,
    { ...template, id: "cash-check", name: "Cash check", category: "accounting-finance" },
  ]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <BotTemplatesDialog onClose={() => undefined} onOpenBot={onOpenBot} />
      </QueryClientProvider>,
    ),
  );
  await vi.waitFor(() => expect(button("All")).toBeTruthy());
  expect(button("Teams")).toBeUndefined();
  expect(bots.teamTemplates).not.toHaveBeenCalled();
});
