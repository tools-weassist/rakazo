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
  await signup(page, `survey-${Date.now()}@rakazo.test`, "password12", "Survey");

  await expect(page.getByRole("heading", { name: "Welcome to Wea" })).toBeVisible();
  await expect(
    page.getByText("The AI assistant for outsourced professionals and business owners."),
  ).toBeVisible();
  await expect(page.getByText("1 of 3", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/onboarding\/survey$/);
  await expect(page.getByText("Do you work with a VA/outsourced professional today?")).toHaveCount(0);
  await captureScreenshot(page, testInfo, "01-signup-survey");

  await page.getByRole("button", { name: "I'm a business owner" }).click();
  await page.getByRole("button", { name: "Yes, one or more" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("2 of 3", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Yes, in Notion" }).click();
  await captureScreenshot(page, testInfo, "02-signup-survey-ai-brain");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("3 of 3", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Writing SOPs" }).click();
  await page.getByLabel("How did you hear about us?").fill("A friend");
  await captureScreenshot(page, testInfo, "03-signup-survey-filled");

  await page.getByRole("button", { name: "Continue", exact: true }).click();
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
