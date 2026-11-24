// @vitest-environment jsdom
import { expect, it } from "vitest";
// @ts-expect-error plain JS motion module
import { WeaChat } from "./chat-demo.js";

it("keeps the demo clients and receipts scene from Brandi's motion pass", () => {
  const blob = JSON.stringify(WeaChat.SCENES);
  expect(blob).toContain("Juniper Row Bakery");
  expect(blob).toContain("Fernwick Florals");
  expect(blob).toContain("Saltmeadow Yoga");
  expect(blob).toContain("File receipts by the 5th.");
  expect(WeaChat.SCENES.map((scene: { bot: string }) => scene.bot)).toEqual([
    "inbox",
    "calendar",
    "content",
    "followup",
    "research",
    "books",
  ]);
});
