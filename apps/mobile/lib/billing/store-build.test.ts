import { describe, expect, it } from "vitest";
import { inAppPurchasesHidden } from "./store-build";

describe("inAppPurchasesHidden", () => {
  it("hides purchases only in the Google Play build", () => {
    expect(inAppPurchasesHidden("play")).toBe(true);
    expect(inAppPurchasesHidden(undefined)).toBe(false);
    expect(inAppPurchasesHidden("")).toBe(false);
    expect(inAppPurchasesHidden("sideload")).toBe(false);
  });
});
