import { test, expect } from "@playwright/test";

test.describe("Form Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("generate button should be disabled when form is incomplete", async ({ page }) => {
    const button = page.locator("button", { hasText: /generate/i });
    await expect(button).toBeDisabled();
  });

  test("should type in the prompt textarea", async ({ page }) => {
    const textarea = page.locator("textarea");
    await textarea.fill("The rise and fall of the Roman Empire");
    await expect(textarea).toHaveValue("The rise and fall of the Roman Empire");
  });

  test("should select a tone", async ({ page }) => {
    const dramaticCard = page.getByText("Dramatic").first();
    await dramaticCard.click();
    // Button for dramatic tone should have aria-pressed=true
    const pressed = page.locator("button[aria-pressed='true']");
    await expect(pressed).toBeVisible();
  });

  test("should select a length", async ({ page }) => {
    const lengthButton = page.getByText("3 min").first();
    await lengthButton.click();
    const pressed = page.locator("button[aria-pressed='true']");
    await expect(pressed).toBeVisible();
  });

  test("should enable generate button when form is complete", async ({ page, browserName }) => {
    await page.locator("textarea").fill("The rise and fall of the Roman Empire");

    const dramaticBtn = page.locator("button[aria-pressed]", { hasText: "Dramatic" });
    const fiveMinBtn = page.locator("button[aria-pressed]", { hasText: "5 min" });

    if (browserName === "webkit") {
      // WebKit mobile: dispatch click via JS to ensure React onClick fires
      await dramaticBtn.evaluate((el) => (el as HTMLElement).click());
      await fiveMinBtn.evaluate((el) => (el as HTMLElement).click());
    } else {
      await dramaticBtn.click({ force: true });
      await fiveMinBtn.click({ force: true });
    }

    const button = page.locator("button", { hasText: /generate/i });
    await expect(button).toBeEnabled({ timeout: 8000 });
  });

  test("should show character count on input", async ({ page }) => {
    const textarea = page.locator("textarea");
    await textarea.fill("Hello");
    // The counter is an absolute-positioned div; check its text content
    const counter = page.locator("div").filter({ hasText: /^\d+ \/ \d+$/ }).first();
    await expect(counter).toBeVisible({ timeout: 5000 });
    await expect(counter).toContainText("5");
  });

  test("should enforce max character limit", async ({ page }) => {
    const textarea = page.locator("textarea");
    const longText = "A".repeat(501);
    await textarea.fill(longText);
    const value = await textarea.inputValue();
    expect(value.length).toBeLessThanOrEqual(500);
  });
});
