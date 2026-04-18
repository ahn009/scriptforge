import { test, expect } from "@playwright/test";

test.describe("App Loading", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ScriptForge/i);
  });

  test("should display the header with branding", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("text=ScriptForge");
    await expect(header.first()).toBeVisible();
  });

  test("should show the prompt input", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
  });

  test("should show 3 tone options", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Dramatic")).toBeVisible();
    await expect(page.getByText("Neutral")).toBeVisible();
    await expect(page.getByText("Uplifting")).toBeVisible();
  });

  test("should show 4 length options", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("1 min")).toBeVisible();
    await expect(page.getByText("3 min")).toBeVisible();
    await expect(page.getByText("5 min")).toBeVisible();
    await expect(page.getByText("10 min")).toBeVisible();
  });

  test("should show generate button", async ({ page }) => {
    await page.goto("/");
    const button = page.locator("button", { hasText: /generate/i });
    await expect(button).toBeVisible();
  });
});
