import { expect, test } from "@playwright/test";
import { captureScreenshot, signup } from "../helpers/helpers";

test("new users answer Wea's onboarding questions before their first chat", async ({
  page,
}, testInfo) => {
  const submitted: unknown[] = [];
  await page.route("**/rpc/onboarding/signupSurvey", async (route) => {
    submitted.push((route.request().postDataJSON() as { json: unknown }).json);
    await route.fulfill({ json: { json: { ok: true } } });
  });

  // Servers without billing ask too.
  await signup(page, `survey-${Date.now()}@rakazo.test`, "password12", "Survey Person");

  await expect(page.getByRole("heading", { name: "Hi, I'm Chief" })).toBeVisible();
  await expect(page).toHaveURL(/\/onboarding\/survey$/);
  await captureScreenshot(page, testInfo, "01-signup-survey");
  await page.getByRole("button", { name: "Let's go!", exact: true }).click();
  // The name only personalizes the questions; it comes from the account and is never saved.
  await expect(page.getByLabel("Your first name")).toHaveValue("Survey");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "Survey, which best describes you?" }),
  ).toBeVisible();
  await captureScreenshot(page, testInfo, "02-signup-survey-role");
  await page.getByRole("button", { name: "I'm a business owner" }).click();
  await page.getByRole("button", { name: "Yes, one or more" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Writing SOPs" }).click();
  await captureScreenshot(page, testInfo, "03-signup-survey-team");
  await page.getByRole("button", { name: "That's all for now" }).click();
  await page.getByRole("button", { name: /^Notion/ }).click();
  await expect(
    page.getByRole("heading", { name: "Survey, how did you hear about us?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Somewhere else" }).click();
  await page.getByLabel("Where did you hear about us?").fill("A friend");
  await captureScreenshot(page, testInfo, "04-signup-survey-source");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  // Browsers that can still ask for notifications offer them first; any answer moves on.
  await page.waitForURL(/\/(app\/|onboarding\/notifications)/, { timeout: 20_000 });
  if (page.url().includes("/onboarding/notifications")) {
    await captureScreenshot(page, testInfo, "05-onboarding-notifications");
    await page.getByRole("button", { name: "Maybe later", exact: true }).click();
  }
  await page.waitForURL(/\/app\//, { timeout: 20_000 });
  expect(submitted).toEqual([
    {
      role: "business_owner",
      roleDetail: "has_va",
      brain: "notion",
      needs: ["sops"],
      source: "A friend",
    },
  ]);
});
