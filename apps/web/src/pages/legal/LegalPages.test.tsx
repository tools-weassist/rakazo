// @vitest-environment jsdom

import type { ReactNode } from "react";
import { act } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isLegalPath, LegalPage, WEA_PRIVACY_EMAIL } from "./LegalPages";

vi.mock("@lingui/react/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  useLingui: () => ({
    t: (parts: TemplateStringsArray, ...values: unknown[]) =>
      parts.reduce(
        (text, part, index) => `${text}${index > 0 ? values[index - 1] : ""}${part}`,
        "",
      ),
  }),
}));

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("legal pages", () => {
  it("serves only the privacy and delete-account paths", () => {
    expect(isLegalPath("/privacy")).toBe(true);
    expect(isLegalPath("/privacy/")).toBe(true);
    expect(isLegalPath("/delete-account")).toBe(true);
    expect(isLegalPath("/")).toBe(false);
    expect(isLegalPath("/app")).toBe(false);
    expect(isLegalPath("/privacy/extra")).toBe(false);
  });

  it("shows the Wea privacy policy with a contact address", () => {
    act(() => root.render(<LegalPage pathname="/privacy" />));
    expect(container.querySelector("h1")?.textContent).toBe("Wea privacy policy");
    expect(document.title).toBe("Wea privacy policy | Wea");
    expect(container.textContent).toContain("Limited Use");
    expect(container.querySelector(`a[href="mailto:${WEA_PRIVACY_EMAIL}"]`)).not.toBeNull();
    expect(container.textContent).not.toMatch(/rakazo/i);
  });

  it("explains how to delete a Wea account in the app, on the web and by email", () => {
    act(() => root.render(<LegalPage pathname="/delete-account" />));
    expect(container.querySelector("h1")?.textContent).toBe("Delete your Wea account");
    const text = container.textContent ?? "";
    expect(text).toContain("In the Wea app");
    expect(text).toContain("On the web");
    expect(text).toContain("Delete my Wea account");
    expect(text).not.toMatch(/rakazo/i);
  });
});
