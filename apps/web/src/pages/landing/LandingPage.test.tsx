// @vitest-environment jsdom
import {
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_ANDROID_VERSION,
  WEA_DESKTOP_DOWNLOAD_URL,
  WEA_DESKTOP_VERSION,
} from "@rakazo/contracts";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LandingPage } from "./LandingPage";

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

async function renderPage() {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    ),
  );
}

it("renders Brandi's landing copy, real bot names, and the download links", async () => {
  await renderPage();
  expect(host.querySelector('[data-testid="landing-page"]')).not.toBeNull();
  expect(host.textContent).toContain("Breathe, the busywork is handled.");
  expect(host.textContent).toMatch(/Wea gives business owners, outsourced professionals or virtual assistants teams of AI\sbots/);
  expect(host.textContent).toContain("Work with Wea like a calm, capable team");
  expect(host.textContent).toContain("Hire the team your work needs");
  expect(host.textContent).toContain("3 teams,");
  expect(host.textContent).toContain("11 bots working right now");
  expect(host.textContent).toContain("Admin and inbox");
  expect(host.textContent).toContain("Sales and leads");
  expect(host.textContent).toContain("Marketing and content");
  expect(host.textContent).toContain("Finance and books");
  expect(host.textContent).toContain("Customer support");
  expect(host.textContent).toContain("Research and planning");
  expect(host.textContent).toContain("Invoice chaser");
  expect(host.textContent).toContain("Support replies");
  expect(host.textContent).toContain("Social scheduler");
  expect(host.textContent).toContain("Review responder");
  expect(host.textContent).toContain("Meeting notes");
  expect(host.textContent).toContain("Bookkeeping helper");
  expect(host.textContent).toContain("Proposal drafter");
  expect(host.textContent).toContain("Wea clears the busywork and keeps your list moving.");
  expect(host.textContent).toContain("For outsourced professionals or virtual assistants");
  expect(host.textContent).toContain("Wea gives you teams of AI bots that take care of everyday busywork");
  expect(host.querySelector("#bots")).not.toBeNull();
  expect(host.querySelectorAll("[data-team-picker] [role=tab]")).toHaveLength(6);
  expect(host.textContent).not.toMatch(/\bsmall\b/i);
  expect(host.querySelector("a[href=\"#bots\"]")).not.toBeNull();
  expect(host.textContent).toContain("Wea for web, Windows and Android");
  expect(host.textContent).toContain("Inbox triage");
  expect(host.textContent).toContain("Calendar keeper");
  expect(host.textContent).toContain("Content calendar");
  expect(host.textContent).toContain("Lead follow-up");
  expect(host.textContent).toContain("Topic watch");
  expect(host.textContent).toContain("Receipt sorter");
  expect(host.textContent).toContain("Wea asks before it acts");
  expect(host.textContent).toContain("Bots hand off to each other");
  expect(host.textContent).toContain("It learns how you work");
  expect(host.textContent).toContain("how you file receipts");
  expect(host.textContent).toContain("suggest a monthly reminder");
  expect(host.querySelector('[data-testid="feature-learns"]')?.textContent).not.toContain("invoices");
  expect(host.textContent).toContain("Three steps to a lighter day");
  expect(host.textContent).toContain(`version ${WEA_DESKTOP_VERSION}`);
  expect(host.textContent).toContain("about 136 MB");
  expect(host.textContent).toContain("Not in the Microsoft Store");
  expect(host.textContent).toContain(`version ${WEA_ANDROID_VERSION}`);
  expect(host.textContent).toContain("direct APK");
  expect(host.textContent).toContain("connect your own AI provider key");
  expect(host.textContent).toContain("Wea is a WeAssist internal pilot");
  expect(host.textContent).toContain("tools@weassist.io");
  expect(document.title).toBe("Wea, breathe, the busywork is handled");

  const hrefs = [...host.querySelectorAll("a")].map((link) => link.getAttribute("href"));
  expect(hrefs).toContain("/sign-in");
  expect(hrefs).toContain("/sign-up");
  expect(hrefs).toContain("/download");
  expect(hrefs).toContain(WEA_DESKTOP_DOWNLOAD_URL);
  expect(hrefs).toContain(WEA_ANDROID_DOWNLOAD_URL);
  expect(hrefs).toContain("mailto:tools@weassist.io");
  expect(hrefs).not.toContain("/privacy");
  expect(hrefs).not.toContain("/terms");

  expect(host.textContent).not.toMatch(/free trial|How much does Wea cost|pricing|Google Play|Microsoft Store badge|AI Space|Discord|rakazo\.com/i);
  expect(host.querySelector("a[href=\"/privacy\"], a[href=\"/terms\"]")).toBeNull();
  expect(host.textContent).not.toMatch(/[\u2013\u2014!]/);
});
