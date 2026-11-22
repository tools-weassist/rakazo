// @vitest-environment jsdom

import { tokensForAppearance } from "@rakazo/ui-tokens";
import type { CSSProperties, ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { FilterChips } from "./filter-chips";

const flatten = (style: unknown): CSSProperties =>
  Array.isArray(style)
    ? Object.assign({}, ...style.map(flatten))
    : ((style ?? {}) as CSSProperties);

vi.mock("react-native", () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Platform: { OS: "android" },
  ScrollView: ({
    children,
    horizontal,
    testID,
  }: {
    children: ReactNode;
    horizontal?: boolean;
    testID?: string;
  }) => (
    <div data-testid={testID} data-horizontal={String(Boolean(horizontal))}>
      {children}
    </div>
  ),
  Pressable: ({
    children,
    style,
    accessibilityState,
    onPress,
  }: {
    children: ReactNode;
    style: unknown;
    accessibilityState?: { selected?: boolean };
    onPress?: () => void;
  }) => (
    <button
      type="button"
      aria-pressed={accessibilityState?.selected}
      data-style={JSON.stringify(flatten(style))}
      onClick={onPress}
    >
      {children}
    </button>
  ),
  Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock("../../lib/native/native", () => ({
  useMobileTokens: () => tokensForAppearance("light"),
}));
vi.mock("../../lib/appearance/ripple", () => ({
  androidRipple: () => undefined,
  withAlpha: (color: string) => color,
}));

it("keeps one sideways row whose chips don't change size when one is picked", async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div");
  const root = createRoot(host);
  const onChange = vi.fn();
  const render = (value: "marketing" | "operations" | null) =>
    act(async () =>
      root.render(
        <FilterChips
          options={[
            { key: null, label: "All" },
            { key: "marketing", label: "Marketing" },
            { key: "operations", label: "Operations" },
          ]}
          value={value}
          onChange={onChange}
          accessibilityLabel="Filter"
          testID="chips"
        />,
      ),
    );
  const box = () =>
    [...host.querySelectorAll("button")].map((button) => {
      const style = JSON.parse(button.dataset.style ?? "{}") as CSSProperties;
      return [style.height, style.borderWidth, style.paddingHorizontal];
    });
  await render(null);
  expect(host.querySelector('[data-testid="chips"]')?.getAttribute("data-horizontal")).toBe("true");
  const before = box();
  await render("marketing");
  expect(box()).toEqual(before);
  expect(new Set(box().map(String)).size).toBe(1);
  expect([...host.querySelectorAll("button")].map((b) => b.getAttribute("aria-pressed"))).toEqual([
    "false",
    "true",
    "false",
  ]);
  await act(async () => host.querySelectorAll("button")[2]?.click());
  expect(onChange).toHaveBeenCalledWith("operations");
  await act(async () => root.unmount());
});
