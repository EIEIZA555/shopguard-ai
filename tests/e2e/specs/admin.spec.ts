import { test, expect } from "@playwright/test";

test.describe("Admin Test Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("email-input").fill("admin@shopguard.dev");
    await page.getByTestId("password-input").fill("Admin123!");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("user-name")).toContainText("Shop Admin");
  });

  test("admin can access test dashboard", async ({ page }) => {
    await page.goto("/admin/tests");
    await expect(page.getByTestId("test-dashboard")).toBeVisible();
  });

  test("customer cannot access admin dashboard", async ({ page }) => {
    await page.getByTestId("logout-btn").click();
    await page.goto("/login");
    await page.getByTestId("email-input").fill("customer@shopguard.dev");
    await page.getByTestId("password-input").fill("Test123!");
    await page.getByTestId("login-submit").click();
    await page.goto("/admin/tests");
    await expect(page).not.toHaveURL(/admin\/tests/);
  });
});
