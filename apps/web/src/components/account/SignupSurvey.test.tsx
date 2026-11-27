// @vitest-environment jsdom

import type { ReactNode } from "react";
import { act } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const signupSurvey = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("../../lib/query/rpc", () => ({ rpc: { onboarding: { signupSurvey } } }));
vi.mock("@lingui/react/macro", () => {
  const t = (parts: TemplateStringsArray, ...values: unknown[]) => String.raw(parts, ...values);
  return {
    useLingui: () => ({ t }),
    Trans: ({ children }: { children?: ReactNode }) => children,
  };
});

import { SignupSurvey } from "./SignupSurvey";

let container: HTMLDivElement;
let root: Root;
const onDone = vi.fn();

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  signupSurvey.mockClear();
  onDone.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<SignupSurvey onDone={onDone} />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function button(name: string): HTMLButtonElement {
  const found = [...container.querySelectorAll("button")].find(
    (element) => element.textContent?.trim() === name,
  );
  if (!found) throw new Error(`No button ${name}`);
  return found;
}
async function click(name: string) {
  await act(async () => button(name).click());
}

it("moves through three steps and sends the retained answers once", async () => {
  expect(container.textContent).toContain("Welcome to Wea");
  expect(container.textContent).toContain(
    "The AI assistant for outsourced professionals and business owners.",
  );
  expect(container.textContent).toContain("1 of 3");
  expect(container.textContent).not.toContain("AI brain");
  expect(container.textContent).not.toContain("Rakazo");
  await click("I'm a virtual assistant or outsourced professional");
  await click("One client");
  await click("Next");
  expect(container.textContent).toContain("2 of 3");
  await click("Yes, in Google Drive");
  await click("Back");
  expect(container.querySelector('[aria-pressed="true"]')?.textContent).toBe(
    "I'm a virtual assistant or outsourced professional",
  );
  await click("Next");
  expect(button("Yes, in Google Drive").getAttribute("aria-pressed")).toBe("true");
  await click("Next");
  expect(container.textContent).toContain("3 of 3");
  await click("Client reports (EOD)");
  await click("Handoffs across time zones");
  await click("Learning AI skills");
  const input = container.querySelector<HTMLInputElement>('input[placeholder="Optional"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
      input,
      "A friend",
    );
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await click("Back");
  await click("Next");
  expect(button("Handoffs across time zones").getAttribute("aria-pressed")).toBe("true");
  expect(container.querySelector<HTMLInputElement>('input[placeholder="Optional"]')?.value).toBe(
    "A friend",
  );
  await act(async () => {
    button("Continue").click();
    button("Continue").click();
  });
  expect(signupSurvey).toHaveBeenCalledWith({
    role: "va",
    roleDetail: "one_client",
    brain: "drive",
    needs: ["handoffs", "ai_skills"],
    source: "A friend",
  });
  expect(signupSurvey).toHaveBeenCalledOnce();
  expect(onDone).toHaveBeenCalled();
});

it("offers GitHub as an AI brain and sends that answer", async () => {
  await click("Next");
  await click("Yes, in GitHub");
  await click("Next");
  await click("Continue");
  expect(signupSurvey).toHaveBeenCalledWith({ brain: "github" });
});

it("drops a follow-up from another role and explains an AI brain", async () => {
  await click("I'm a business owner");
  await click("Yes, one or more");
  await click("Just exploring");
  expect(container.textContent).not.toContain("Do you work with a VA today?");
  await click("Next");
  await click("What's an AI brain?");
  expect(container.textContent).toContain("We can set one up for you.");
  await click("Next");
  await click("Continue");
  expect(signupSurvey).toHaveBeenCalledWith({ role: "exploring", brain: "unsure" });
});

it("skips everything", async () => {
  await click("I'm a business owner");
  await click("Skip for now");
  expect(signupSurvey).toHaveBeenCalledWith({});
  expect(onDone).toHaveBeenCalled();
});
