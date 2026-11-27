// @vitest-environment jsdom
import {
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_DESKTOP_DOWNLOAD_URL,
} from "@rakazo/contracts";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { WeaPilotFooter } from "./WeaBrand";

vi.mock("@lingui/react/macro", () => ({
  useLingui: () => ({
    t: (strings: TemplateStringsArray, ...values: unknown[]) =>
      strings.reduce((text, part, index) => text + part + (values[index] ?? ""), ""),
  }),
  Trans: ({ children }: { children: ReactNode }) => children,
}));

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it("links to the Wea Windows and Android downloads under sign-in", async () => {
  await act(async () => root.render(<WeaPilotFooter />));
  const links = [...host.querySelectorAll("a")];
  const desktop = links.find((link) => link.textContent === "Desktop (Windows)");
  const android = links.find((link) => link.textContent === "Android");
  const support = links.find((link) => link.textContent === "Support");
  expect(desktop?.getAttribute("href")).toBe(WEA_DESKTOP_DOWNLOAD_URL);
  expect(android?.getAttribute("href")).toBe(WEA_ANDROID_DOWNLOAD_URL);
  expect(support?.getAttribute("href")).toBe("mailto:tools@weassist.io");
  expect(host.textContent).toContain("Wea is a WeAssist internal pilot");
  expect(host.innerHTML).not.toMatch(/play\.google\.com|apps\.apple\.com|com\.rakazo\.app/i);
});
