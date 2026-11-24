// @vitest-environment jsdom
import {
  WEA_ANDROID_APK_SHA256,
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_DESKTOP_DOWNLOAD_URL,
  WEA_DESKTOP_SETUP_SHA256,
} from "@rakazo/contracts";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DownloadPage } from "./DownloadPage";

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

it("shows Windows and Android installers, checksums and sideload tips", async () => {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>,
    ),
  );
  expect(host.querySelector('[data-testid="download-page"]')).not.toBeNull();
  expect(host.textContent).toContain("Download Wea");
  expect(host.textContent).toContain("More info");
  expect(host.textContent).toContain("Run anyway");
  expect(host.textContent).toContain("unknown apps");
  expect(host.textContent).toContain("Mac and Linux installers are coming later");
  expect(host.textContent).toContain(WEA_DESKTOP_SETUP_SHA256);
  expect(host.textContent).toContain(WEA_ANDROID_APK_SHA256);
  const hrefs = [...host.querySelectorAll("a")].map((link) => link.getAttribute("href"));
  expect(hrefs).toContain(WEA_DESKTOP_DOWNLOAD_URL);
  expect(hrefs).toContain(WEA_ANDROID_DOWNLOAD_URL);
  expect(hrefs).toContain("/sign-in");
  expect(host.innerHTML).not.toMatch(/play\.google\.com|apps\.apple\.com|com\.rakazo\.app/i);
});
