// @vitest-environment jsdom

import type { SignupSurvey as SignupSurveyAnswers } from "@rakazo/contracts";
import type { ReactNode } from "react";
import { act, useState } from "react";
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

function Survey({ name = "", initial }: { name?: string; initial?: SignupSurveyAnswers }) {
  const [firstName, setFirstName] = useState(name);
  return (
    <SignupSurvey initial={initial} name={firstName} onNameChange={setFirstName} onDone={onDone} />
  );
}

async function render(survey: ReactNode) {
  await act(async () => root.render(survey));
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  signupSurvey.mockClear();
  onDone.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

/** A button by its visible text, its accessible name, or the title on a style card. */
function button(name: string): HTMLButtonElement {
  const found = [...container.querySelectorAll("button")].find(
    (element) =>
      element.textContent?.trim() === name ||
      element.getAttribute("aria-label") === name ||
      element.querySelector("b")?.textContent === name ||
      [...element.children].some((child) => child.textContent === name),
  );
  if (!found) throw new Error(`No button ${name}`);
  return found;
}
async function click(name: string) {
  await act(async () => button(name).click());
}
const pressed = (name: string) => button(name).getAttribute("aria-pressed");
const heading = () => container.querySelector("h1")?.textContent;
async function type(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
/** From Chief's hello past the name screen to the first question. */
async function toQuestions() {
  await click("Continue");
  await click("Continue");
}

it("asks one question per screen by name and sends the retained answers once", async () => {
  await render(<Survey name="Eric" />);
  expect(heading()).toBe("Hi, I'm Chief");
  expect(container.textContent).not.toContain("Rakazo");
  expect(container.textContent).not.toContain("WeAssist");
  await click("Continue");
  expect(
    container.querySelector<HTMLInputElement>('input[aria-label="Your first name"]')?.value,
  ).toBe("Eric");
  await click("Continue");
  expect(heading()).toBe("Eric, which best describes you?");
  expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-label")).toBe(
    "Question 1 of 5",
  );

  await click("I'm a virtual assistant or outsourced professional");
  expect(heading()).toBe("Eric, who do you work for right now?");
  expect(button("Continue").disabled).toBe(true);
  await click("One client");
  await click("Continue");

  expect(heading()).toBe("Eric, build your team");
  expect(button("Maybe later")).toBeDefined();
  await click("Client reports (EOD)");
  await click("Handoffs across time zones");
  await click("Learning AI skills");
  expect(pressed("Client reports (EOD)")).toBe("false");
  expect(pressed("Handoffs across time zones")).toBe("true");
  await click("That's all for now");

  expect(heading()).toBe("Where does your business knowledge live?");
  await click("What's an AI brain?");
  expect(container.textContent).toContain("Chief can set one up with you after this.");
  await click("Got it");
  expect(heading()).toBe("Eric, how did you hear about us?");

  // Back keeps every answer.
  await click("Back");
  expect(pressed("What's an AI brain?")).toBe("true");
  await click("Back");
  expect(pressed("Handoffs across time zones")).toBe("true");
  await click("Back");
  expect(pressed("One client")).toBe("true");
  await click("Back");
  expect(pressed("I'm a virtual assistant or outsourced professional")).toBe("true");
  // Tapping the same role again keeps its follow-up and needs.
  await click("I'm a virtual assistant or outsourced professional");
  await click("Continue");
  await click("That's all for now");
  await click("Google Drive");

  await act(async () => {
    button("A friend or colleague").click();
    button("A friend or colleague").click();
  });
  expect(signupSurvey).toHaveBeenCalledWith({
    role: "va",
    roleDetail: "one_client",
    brain: "drive",
    needs: ["handoffs", "ai_skills"],
    source: "A friend or colleague",
  });
  expect(signupSurvey).toHaveBeenCalledOnce();
  expect(onDone).toHaveBeenCalledOnce();
});

it("asks plainly without a name and only uses a typed name on screen", async () => {
  await render(<Survey />);
  await toQuestions();
  expect(heading()).toBe("Which best describes you?");
  await click("Back");
  await type(
    container.querySelector<HTMLInputElement>('input[aria-label="Your first name"]')!,
    "Ana Cruz",
  );
  await click("Continue");
  expect(heading()).toBe("Ana, which best describes you?");
  await click("Skip");
  await click("Skip");
  await click("Skip");
  expect(signupSurvey).toHaveBeenCalledWith({});
});

it("skips each question, clearing a skipped answer and the ones that depended on it", async () => {
  await render(<Survey />);
  await toQuestions();
  await click("I'm a business owner");
  await click("Yes, one or more");
  await click("Continue");
  await click("Writing SOPs");
  await click("Back");
  await click("Back");
  // Without a role there is no follow-up or team question.
  await click("Skip");
  expect(heading()).toBe("Where does your business knowledge live?");
  await click("Not yet");
  await click("Skip");
  expect(signupSurvey).toHaveBeenCalledWith({ brain: "none" });
});

it("offers GitHub as an AI brain and sends that answer", async () => {
  await render(<Survey />);
  await toQuestions();
  await click("Skip");
  await click("GitHub");
  await click("Skip");
  expect(signupSurvey).toHaveBeenCalledWith({ brain: "github" });
});

it("drops a follow-up from another role", async () => {
  await render(<Survey />);
  await toQuestions();
  await click("I'm a business owner");
  await click("Yes, one or more");
  await click("Continue");
  await click("Back");
  await click("Back");
  await click("Just exploring");
  // Exploring has no follow-up, so it goes straight to the team.
  expect(heading()).toBe("Build your team");
  expect(container.textContent).not.toContain("Writing SOPs");
  await click("Research and writing");
  await click("That's all for now");
  await click("Skip");
  await click("YouTube");
  expect(signupSurvey).toHaveBeenCalledWith({
    role: "exploring",
    needs: ["research"],
    source: "YouTube",
  });
});

it("takes a typed answer for somewhere else, or saves that it was somewhere else", async () => {
  await render(<Survey />);
  await toQuestions();
  await click("Skip");
  await click("Skip");
  await click("Somewhere else");
  expect(signupSurvey).not.toHaveBeenCalled();
  await type(
    container.querySelector<HTMLInputElement>('input[aria-label="Where did you hear about us?"]')!,
    " A podcast ",
  );
  await click("Continue");
  expect(signupSurvey).toHaveBeenCalledWith({ source: "A podcast" });

  await act(async () => root.unmount());
  root = createRoot(container);
  signupSurvey.mockClear();
  await render(<Survey />);
  await toQuestions();
  await click("Skip");
  await click("Skip");
  await click("Somewhere else");
  await click("Continue");
  expect(signupSurvey).toHaveBeenCalledWith({ source: "Somewhere else" });
});

it("reopens the last question with the earlier answers when coming back", async () => {
  await render(
    <Survey
      initial={{
        role: "va",
        roleDetail: "one_client",
        needs: ["eod"],
        brain: "notion",
        source: "A podcast",
      }}
    />,
  );
  expect(heading()).toBe("How did you hear about us?");
  expect(pressed("Somewhere else")).toBe("true");
  expect(
    container.querySelector<HTMLInputElement>('input[aria-label="Where did you hear about us?"]')
      ?.value,
  ).toBe("A podcast");
  await click("Back");
  expect(pressed("Notion")).toBe("true");
});

it("skips everything from Chief's hello", async () => {
  await render(<Survey name="Eric" />);
  await click("Skip for now");
  expect(signupSurvey).toHaveBeenCalledWith({});
  expect(onDone).toHaveBeenCalled();
});
