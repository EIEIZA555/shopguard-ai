import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("customer can login", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("email-input").fill("customer@shopguard.dev");
    await page.getByTestId("password-input").fill("Test123!");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("user-name")).toContainText("Demo Customer");
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("email-input").fill("wrong@email.com");
    await page.getByTestId("password-input").fill("wrongpass");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("login-error")).toBeVisible();
  });

  test("redirects to login when accessing orders unauthenticated", async ({ page }) => {
    await page.goto("/orders");
    await expect(page).toHaveURL(/login/);
  });
});
