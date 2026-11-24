// @vitest-environment jsdom
import {
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_DESKTOP_DOWNLOAD_URL,
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

it("shows the landing sections, CTAs, and download links", async () => {
  await renderPage();
  expect(host.querySelector('[data-testid="landing-page"]')).not.toBeNull();
  expect(host.textContent).toContain("Meet Wea");
  expect(host.textContent).toContain("Breathe, the busywork is handled.");
  expect(host.textContent).toContain("Hero subhead (placeholder)");
  expect(host.textContent).toContain("Intro headline (placeholder)");
  expect(host.querySelector('[data-testid="landing-media"]')).not.toBeNull();
  expect(host.querySelector('[data-testid="feature-initiative"]')).not.toBeNull();
  expect(host.textContent).toContain("Business owner");
  expect(host.textContent).toContain("Virtual assistant (VA)");
  expect(host.textContent).toContain("VA agency or team");
  expect(host.textContent).toContain("Just exploring");
  expect(host.textContent).toContain("Pricing (placeholder)");
  expect(host.textContent).toContain("Download Wea");
  expect(host.textContent).toContain("Guides (placeholder)");
  expect(host.textContent).toContain("FAQs");
  expect(host.textContent).toContain("Closing headline (placeholder)");
  expect(document.title).toContain("Wea");

  const hrefs = [...host.querySelectorAll("a")].map((link) => link.getAttribute("href"));
  expect(hrefs).toContain("/sign-in");
  expect(hrefs).toContain("/sign-up");
  expect(hrefs).toContain("/download");
  expect(hrefs).toContain(WEA_DESKTOP_DOWNLOAD_URL);
  expect(hrefs).toContain(WEA_ANDROID_DOWNLOAD_URL);
  expect(hrefs).toContain("mailto:tools@weassist.io");
  expect(host.textContent).not.toMatch(/WeAssist|AI Space|Rakazo|rakazo\.com|Discord/i);
});
