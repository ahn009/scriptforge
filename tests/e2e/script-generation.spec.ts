import { test, expect } from "@playwright/test";

test.describe("Script Generation (requires API key)", () => {
  test.skip(!process.env.GEMINI_API_KEY, "Skipping — no GEMINI_API_KEY");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("textarea").fill("The life and death of Cleopatra");
    await page.getByText("Dramatic").first().click();
    await page.getByText("3 min").first().click();
  });

  test("should generate a script when clicking generate", async ({ page }) => {
    const button = page.locator("button", { hasText: /generate/i });
    await button.click();
    await expect(page.getByText(/generating/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/HOOK|hook/i).first()).toBeVisible({ timeout: 45000 });
  });

  test("should show the script viewer after generation", async ({ page }) => {
    const button = page.locator("button", { hasText: /generate/i });
    await button.click();
    await expect(page.getByText(/copy/i).first()).toBeVisible({ timeout: 60000 });
  });
});
