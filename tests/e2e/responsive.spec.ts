import { test, expect } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("should render correctly on mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.getByText("Dramatic")).toBeVisible();
    await expect(page.getByText("1 min")).toBeVisible();
  });

  test("should render correctly on tablet (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.getByText("Dramatic")).toBeVisible();
  });

  test("should render correctly on desktop (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.getByText("Dramatic")).toBeVisible();
  });
});
