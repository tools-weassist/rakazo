// @vitest-environment jsdom

import type { ReactNode } from "react";
import { act } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("@lingui/react/macro", () => ({
  Trans: ({ children }: { children?: ReactNode }) => children,
}));

import type { BrowserNotificationApi } from "../../lib/platform/browser-notifications";
import { canAskForNotifications, NotificationsStep } from "./notifications-step";

let container: HTMLDivElement;
let root: Root;
const onDone = vi.fn();

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  onDone.mockClear();
  container = document.body.appendChild(document.createElement("div"));
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function render(api: BrowserNotificationApi | undefined) {
  await act(async () => root.render(<NotificationsStep onDone={onDone} api={api} />));
}
async function click(name: string) {
  const found = [...container.querySelectorAll("button")].find(
    (button) => button.textContent === name,
  );
  await act(async () => found!.click());
}

it("is only offered while the browser can still ask", () => {
  expect(canAskForNotifications(undefined)).toBe(false);
  for (const permission of ["granted", "denied"] as const) {
    expect(canAskForNotifications({ permission, requestPermission: vi.fn() })).toBe(false);
  }
  expect(canAskForNotifications({ permission: "default", requestPermission: vi.fn() })).toBe(true);
});

it("moves on once when the browser has no notifications", async () => {
  await render(undefined);
  expect(container.querySelector("h1")?.textContent).toBe("Before you start");
  await click("Turn on notifications");
  await click("Turn on notifications");
  expect(onDone).toHaveBeenCalledOnce();
});

it("moves on when asking fails, and never twice", async () => {
  const requestPermission = vi.fn(() => Promise.reject(new Error("blocked by the browser")));
  await render({ permission: "default", requestPermission });
  await click("Turn on notifications");
  await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
  await click("Maybe later");
  expect(onDone).toHaveBeenCalledOnce();
});

it("does not wait on an unanswered prompt to move on later", async () => {
  const requestPermission = vi.fn(() => new Promise<"default">(() => {}));
  await render({ permission: "default", requestPermission });
  await click("Turn on notifications");
  expect(onDone).not.toHaveBeenCalled();
  await click("Maybe later");
  expect(onDone).toHaveBeenCalledOnce();
});
