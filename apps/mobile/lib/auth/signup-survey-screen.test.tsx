// @vitest-environment jsdom

import { deferred, flush } from "@rakazo/core/test-async";
import type { ReactNode } from "react";
import { act, createContext } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SignupSurvey from "../../app/(settings)/signup-survey";

const state = vi.hoisted(() => ({
  selectedSpace: "space-1",
  rpc: vi.fn(),
  close: vi.fn(),
}));

vi.mock("../layout/side-insets", () => ({ useSideInsets: () => ({}) }));
vi.mock("../api/api", () => ({
  rpc: state.rpc,
  currentApiBase: () => "http://api.test",
  selectedSpaceId: () => state.selectedSpace,
  captureApiRequestContext: async (spaceId: string | null = state.selectedSpace) => ({
    apiBase: "http://api.test",
    sessionGeneration: 1,
    headers: spaceId ? { "x-rakazo-space-id": spaceId } : {},
  }),
}));
vi.mock("../api/session", () => ({ currentSessionGeneration: () => 1 }));
vi.mock("../settings/settings-sheet", () => ({ closeSettingsSheet: state.close }));
vi.mock("../calls/call-keyboard-context", () => ({ CallKeyboardContext: createContext(false) }));
vi.mock("../native/native", () => ({
  native: {},
  useThemedStyles: (create: () => unknown) => create(),
}));
vi.mock("react-native", () => {
  const View = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    KeyboardAvoidingView: View,
    ScrollView: View,
    View,
    Platform: { OS: "ios" },
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
    TextInput: ({
      accessibilityLabel,
      onChangeText,
      value,
    }: {
      accessibilityLabel: string;
      onChangeText: (value: string) => void;
      value: string;
    }) => (
      <input
        aria-label={accessibilityLabel}
        onChange={(event) => onChangeText(event.currentTarget.value)}
        value={value}
      />
    ),
  };
});
vi.mock("../../components/ui/menu-picker", () => ({
  MenuPickerMenu: ({
    children,
    choices,
    onChange,
    value,
  }: {
    children?: ReactNode;
    choices: { key: string; label: string }[];
    onChange: (value: string) => void;
    value: string;
  }) => (
    <div>
      {children}
      {choices.map((choice) => (
        <button
          aria-pressed={value === choice.key}
          key={choice.key}
          type="button"
          onClick={() => onChange(choice.key)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("../../components/native/native-symbol", () => ({ NativeSymbol: () => null }));
vi.mock("../../components/settings/settings-group", () => ({
  useStackedSettings: () => false,
  SettingsGroup: ({ children, label }: { children?: ReactNode; label?: ReactNode }) => (
    <div>
      {label ? <p>{label}</p> : null}
      {children}
    </div>
  ),
  SettingsRow: ({ title }: { title: string }) => <p>{title}</p>,
}));
vi.mock("../../components/native/native-action-button", () => ({
  NativeActionButton: ({ label, onPress }: { label: string; onPress: () => void }) => (
    <button type="button" onClick={onPress}>
      {label}
    </button>
  ),
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.rpc.mockReset();
  state.close.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<SignupSurvey />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

const surveyButton = (label: string) =>
  [...container.querySelectorAll("button")].find((node) => node.textContent === label)!;
const click = async (label: string) => act(async () => surveyButton(label).click());

it("closes at once and sends the answers once, however often Continue is pressed", async () => {
  const saving = deferred<unknown>();
  state.rpc.mockReturnValue(saving.promise);
  await click("I'm a business owner");
  await click("Next");
  await click("Next");
  await act(async () => {
    surveyButton("Continue").click();
    surveyButton("Continue").click();
  });
  expect(state.close).toHaveBeenCalledOnce();
  expect(state.rpc).toHaveBeenCalledExactlyOnceWith(
    "onboarding/signupSurvey",
    { role: "business_owner" },
    expect.objectContaining({ requestContext: expect.anything() }),
  );
  await act(async () => surveyButton("Continue").click());
  expect(state.rpc).toHaveBeenCalledOnce();
  await act(async () => saving.resolve({}));
});

it("shows one question per step and retains answers when going back", async () => {
  expect(container.textContent).toContain("1 of 3");
  expect(container.textContent).toContain(
    "The AI assistant for outsourced professionals and business owners.",
  );
  expect(container.textContent).toContain("Which best describes you?");
  expect(container.textContent).not.toContain("AI brain");
  expect(container.textContent).not.toContain("What do you want help with first?");
  expect(container.textContent).not.toContain("Rakazo");
  await click("I'm a virtual assistant or outsourced professional");
  await click("Next");
  expect(container.textContent).toContain("2 of 3");
  expect(container.textContent).toContain("AI brain");
  await click("Yes, in Google Drive");
  await click("Back");
  expect(
    surveyButton("I'm a virtual assistant or outsourced professional").getAttribute("aria-pressed"),
  ).toBe("true");
  await click("Next");
  expect(surveyButton("Yes, in Google Drive").getAttribute("aria-pressed")).toBe("true");
  await click("Next");
  expect(container.textContent).toContain("3 of 3");
  expect(container.textContent).toContain("What do you want help with first?");
});

it("lets a failed final save go without holding up the new account", async () => {
  state.rpc.mockRejectedValue(new Error("Offline"));
  await click("Next");
  await click("Next");
  await act(async () => surveyButton("Continue").click());
  await act(flush);
  expect(state.close).toHaveBeenCalledOnce();
  expect(container.textContent).not.toContain("Offline");
});
