// @vitest-environment jsdom
import { flush } from "@rakazo/core/test-async";
import type { ReactNode } from "react";
import { act, useEffect } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import TeamTemplateScreen from "../../app/(settings)/team-template";
import { queryClient } from "../query/query";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  alert: vi.fn(),
  focused: true,
  router: { push: vi.fn() },
  addToSearchInbox: vi.fn(),
  openFromSettingsSheet: vi.fn(),
}));
vi.mock("../layout/side-insets", () => ({ useSideInsets: () => ({}) }));
vi.mock("../native/native", () => ({
  native: {},
  useMobileTokens: () => ({}),
  useResolvedAppearance: () => "light",
  useThemedStyles: (create: () => unknown) => create(),
}));
vi.mock("../appearance/appearance", () => ({ mobileTokens: () => ({}) }));
vi.mock("../api/api", () => ({
  rpc: mocks.rpc,
  currentApiBase: () => "https://app.example.test",
  selectedSpaceId: () => "space-1",
  captureApiRequestContext: async (spaceId: string | null = "space-1") => ({
    apiBase: "https://app.example.test",
    sessionGeneration: 1,
    headers: spaceId ? { "x-rakazo-space-id": spaceId } : {},
  }),
}));
vi.mock("../api/session", () => ({ currentSessionGeneration: () => 1 }));
vi.mock("../search/search-inbox", () => ({
  addToSearchInbox: mocks.addToSearchInbox,
  searchInboxSession: () => "this session",
}));
vi.mock("../settings/settings-sheet", () => ({
  openFromSettingsSheet: mocks.openFromSettingsSheet,
}));
vi.mock("expo-router", () => ({
  useFocusEffect: (effect: () => undefined | (() => void)) =>
    useEffect(() => (mocks.focused ? effect() : undefined), [effect, mocks.focused]),
  useLocalSearchParams: () => ({ id: "test-team" }),
  useNavigation: () => ({ isFocused: () => mocks.focused }),
  useRouter: () => mocks.router,
}));
vi.mock("../../components/bots/bot-template-icon", () => ({ BotTemplateIcon: () => null }));
vi.mock("../../components/native/native-symbol", () => ({ NativeSymbol: () => null }));
vi.mock("../../components/settings/settings-group", () => ({
  SettingsGroup: ({
    label,
    footer,
    children,
  }: {
    label?: string;
    footer?: string;
    children?: ReactNode;
  }) => (
    <section>
      {label ? <h2>{label}</h2> : null}
      {children}
      {footer ? <p>{footer}</p> : null}
    </section>
  ),
  SettingsRow: ({ title, detail }: { title: string; detail?: string }) => (
    <div>
      {title}
      {detail ? ` ${detail}` : ""}
    </div>
  ),
}));
vi.mock("../../components/native/native-action-button", () => ({
  NativeActionButton: ({
    label,
    onPress,
    busy,
  }: {
    label: string;
    onPress: () => void;
    busy?: boolean;
  }) => (
    <button type="button" aria-busy={busy} onClick={onPress}>
      {label}
    </button>
  ),
}));
vi.mock("react-native", () => {
  const View = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    View,
    ScrollView: View,
    Text: View,
    ActivityIndicator: () => <span role="status" />,
    Alert: { alert: mocks.alert },
    StyleSheet: { create: (styles: unknown) => styles },
  };
});

const team = {
  id: "test-team",
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
  lead: "month-end-close",
  members: [
    {
      templateId: "month-end-close",
      role: "Leads the close.",
      name: "Month-end close",
      botId: null,
    },
    {
      templateId: "receipt-sorter",
      role: "Sorts receipts.",
      name: "Receipt sorter",
      botId: "bot-receipts",
    },
  ],
  groupId: null as string | null,
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
const group = {
  id: "group-1",
  name: "Finance team",
  spaceId: "space-1",
  preview: "",
  pinned: false,
  sectionId: null,
  archivedAt: null,
  unread: false,
  updatedAt: "2026-11-22T00:00:00.000Z",
  members: [],
};

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  queryClient.clear();
  mocks.focused = true;
  team.groupId = null;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

async function settle() {
  await act(flush);
}
async function render() {
  await act(async () => root.render(<TeamTemplateScreen />));
  await settle();
}
const action = () => container.querySelector("button") as HTMLButtonElement;

function hold(call: string) {
  let finish!: (outcome: unknown) => void;
  mocks.rpc.mockImplementation((proc: string) =>
    proc === "bots/teamTemplates"
      ? Promise.resolve([{ ...team }])
      : proc === "bots/templates"
        ? Promise.resolve([])
        : proc === call
          ? new Promise((resolve, reject) => {
              finish = (outcome) => (outcome instanceof Error ? reject(outcome) : resolve(outcome));
            })
          : proc === "bots/list"
            ? Promise.resolve([])
            : Promise.reject(new Error(`Unexpected ${proc}`)),
  );
  return {
    finish: async (outcome: unknown) => {
      await act(async () => finish(outcome));
      await settle();
    },
    calls: () => mocks.rpc.mock.calls.filter(([proc]) => proc === call),
  };
}

function expectOpened() {
  expect(mocks.addToSearchInbox.mock.calls).toEqual([[{ kind: "group", group }, "this session"]]);
  expect(mocks.openFromSettingsSheet.mock.calls).toEqual([
    [
      mocks.router,
      { pathname: "/group-thread", params: { groupId: "group-1", name: "Finance team" } },
    ],
  ]);
}

it("shows the team brief and creates the fleet, busy meanwhile, then opens the group chat", async () => {
  const create = hold("bots/createTeamFromTemplate");
  await render();
  const text = container.textContent ?? "";
  expect(text).toContain("Team · 2 bots");
  expect(text).toContain("What it does");
  expect(text).toContain("Sorts receipts together.");
  expect(text).toContain("How it helps you");
  expect(text).toContain("The books stay in motion all month.");
  expect(text).toContain("Success metric");
  expect(text).toContain("Days to close");
  expect(text).toContain("Team members");
  expect(text).toContain("Month-end close · Lead");
  expect(text).toContain("Your existing bot joins the team");
  expect(text).toContain("What you fill in first");
  expect(text).toContain("Close checklist");
  expect(text).toContain("Week one");
  expect(text).toContain("1. Day 1: ask for the checklist");
  expect(text).toContain("Approvals you'll be asked for");
  expect(text).toContain("What this team won't do");
  expect(text).toContain("Move money");
  expect(text).not.toContain("**Finance**");
  expect(action().textContent).toBe("Create team");

  await act(async () => action().click());
  expect(action().getAttribute("aria-busy")).toBe("true");
  expect(action().textContent).toBe("Creating…");
  // A second tap while the first is in flight must not start another create.
  await act(async () => action().click());
  expect(create.calls()).toHaveLength(1);
  expect(create.calls()[0]?.slice(0, 2)).toEqual([
    "bots/createTeamFromTemplate",
    { teamId: "test-team", version: 2 },
  ]);

  await create.finish({ group, members: [], created: true });
  expectOpened();
});

it("still calls create when a group already exists, and labels the action Open team", async () => {
  team.groupId = "group-1";
  const create = hold("bots/createTeamFromTemplate");
  await render();
  expect(action().textContent).toBe("Open team");
  await act(async () => action().click());
  expect(create.calls()).toHaveLength(1);
  await create.finish({ group, members: [], created: false });
  expectOpened();
});

it("says in an alert why the team was not created, and offers the action again", async () => {
  const create = hold("bots/createTeamFromTemplate");
  await render();
  await act(async () => action().click());
  await create.finish(new Error("Server said no"));
  expect(mocks.alert.mock.calls).toEqual([
    ["Could not finish the team. Try again; the bots already made are kept.", "Server said no"],
  ]);
  expect(action().getAttribute("aria-busy")).toBe("false");
  expect(mocks.openFromSettingsSheet).not.toHaveBeenCalled();
  expect(action().textContent).toBe("Create team");
});

it("asks the user to check again when the template changed", async () => {
  const create = hold("bots/createTeamFromTemplate");
  await render();
  await act(async () => action().click());
  const changed = Object.assign(new Error("changed"), { data: { reason: "template_changed" } });
  await create.finish(changed);
  expect(mocks.alert.mock.calls).toEqual([["This template was just updated. Check it again."]]);
  expect(mocks.openFromSettingsSheet).not.toHaveBeenCalled();
});

it.each([
  ["a team", { group, members: [], created: true }],
  ["a failure", new Error("Server said no")],
])("ignores %s that arrives after the screen lost focus", async (_what, outcome) => {
  const create = hold("bots/createTeamFromTemplate");
  await render();
  await act(async () => action().click());
  mocks.focused = false;
  await render();
  await create.finish(outcome);
  expect(mocks.openFromSettingsSheet).not.toHaveBeenCalled();
  expect(mocks.alert).not.toHaveBeenCalled();
});

it.each([
  ["a team", { group, members: [], created: true }],
  ["a failure", new Error("Server said no")],
])("ignores %s that arrives after the screen has gone", async (_what, outcome) => {
  const create = hold("bots/createTeamFromTemplate");
  await render();
  await act(async () => action().click());
  await act(async () => root.render(null));
  await create.finish(outcome);
  expect(mocks.openFromSettingsSheet).not.toHaveBeenCalled();
  expect(mocks.alert).not.toHaveBeenCalled();
});
