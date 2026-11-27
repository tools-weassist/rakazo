// @vitest-environment jsdom
import { flush } from "@rakazo/core/test-async";
import type { ReactNode } from "react";
import { act, useEffect } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import BotTemplatesScreen from "../../app/(settings)/bot-templates";
import { queryClient } from "../query/query";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  router: { push: vi.fn() },
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
vi.mock("expo-router", () => ({
  useFocusEffect: (effect: () => undefined | (() => void)) => useEffect(() => effect(), [effect]),
  useRouter: () => mocks.router,
}));
vi.mock("../../components/bots/bot-template-icon", () => ({ BotTemplateIcon: () => null }));
vi.mock("../../components/native/native-symbol", () => ({ NativeSymbol: () => null }));
vi.mock("../../components/native/filter-chips", () => ({
  FilterChips: ({
    options,
    value,
    onChange,
    testID,
  }: {
    options: Array<{ key: string | null; label: string }>;
    value: string | null;
    onChange: (key: string | null) => void;
    testID?: string;
  }) => (
    <div data-testid={testID}>
      {options.map((option) => (
        <button
          key={String(option.key)}
          type="button"
          aria-pressed={option.key === value}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("../../components/settings/settings-group", () => ({
  SettingsGroup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SettingsRow: ({
    title,
    testID,
    onPress,
  }: {
    title: string;
    testID?: string;
    onPress?: () => void;
  }) => (
    <button type="button" data-testid={testID} onClick={onPress}>
      {title}
    </button>
  ),
}));
vi.mock("../../components/native/native-action-button", () => ({
  NativeActionButton: ({ label, onPress }: { label: string; onPress: () => void }) => (
    <button type="button" onClick={onPress}>
      {label}
    </button>
  ),
}));
vi.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));
vi.mock("react-native", () => {
  const View = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    View,
    ScrollView: View,
    Text: View,
    ActivityIndicator: () => <span role="status" />,
    Platform: { OS: "web" },
    StyleSheet: { create: (styles: unknown) => styles },
  };
});

const single = {
  id: "unknown-single",
  version: 3,
  name: "Weekly digest",
  summary: "A weekly recap",
  sample: "Yesterday",
  whatItDoes: ["Collects updates."],
  howItHelps: ["The recap is written for you."],
  category: "productivity" as const,
  adds: [],
  botId: null,
};
const team = {
  id: "finance-team",
  version: 2,
  name: "Finance team",
  summary: "Close the books together",
  sample: "**Finance**",
  whatItDoes: ["Sorts receipts together."],
  howItHelps: ["The books stay in motion all month."],
  lead: "month-end-close",
  members: [
    { templateId: "month-end-close", role: "Leads.", name: "Month-end close", botId: null },
    { templateId: "receipt-sorter", role: "Sorts.", name: "Receipt sorter", botId: null },
  ],
  groupId: null,
  successMetric: { name: "Days to close", measure: "Days." },
  weekOne: ["Day 1"],
  wontDo: ["Move money"],
  approvals: ["Each reminder"],
  setupInputs: [{ name: "Close checklist", detail: "Your steps." }],
};

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  queryClient.clear();
  mocks.rpc.mockImplementation((proc: string) =>
    proc === "bots/templates"
      ? Promise.resolve([{ ...single }])
      : proc === "bots/teamTemplates"
        ? Promise.resolve([{ ...team }])
        : Promise.reject(new Error(`Unexpected ${proc}`)),
  );
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
  await act(async () => root.render(<BotTemplatesScreen />));
  await settle();
}
const titles = () =>
  [...container.querySelectorAll("button[data-testid]")].map(
    (node) => [node.getAttribute("data-testid"), node.textContent] as const,
  );
const chips = () =>
  [...container.querySelectorAll('[data-testid="bot-template-categories"] button')].map((chip) => [
    chip.textContent,
    chip.getAttribute("aria-pressed"),
  ]);

it("lists teams first on All, only teams under Teams, and opens the team page", async () => {
  await render();
  expect(chips()).toEqual([
    ["All", "true"],
    ["Teams", "false"],
    ["Productivity", "false"],
  ]);
  expect(titles()).toEqual([
    ["team-template-row", "Finance team"],
    ["bot-template-row", "Weekly digest"],
  ]);

  await act(async () => {
    const teams = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Teams",
    );
    teams?.click();
  });
  expect(titles()).toEqual([["team-template-row", "Finance team"]]);

  await act(async () => {
    const category = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Productivity",
    );
    category?.click();
  });
  expect(titles()).toEqual([["bot-template-row", "Weekly digest"]]);

  await act(async () => {
    const all = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "All",
    );
    all?.click();
  });
  await act(async () => {
    (container.querySelector('[data-testid="team-template-row"]') as HTMLButtonElement).click();
  });
  expect(mocks.router.push).toHaveBeenCalledWith({
    pathname: "/team-template",
    params: { id: "finance-team" },
  });
});
