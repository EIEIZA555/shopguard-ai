import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("email-input").fill("customer@shopguard.dev");
    await page.getByTestId("password-input").fill("Test123!");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("user-name")).toBeVisible();
  });

  test("complete checkout journey", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("add-to-cart-1").click();
    await page.getByTestId("add-to-cart-2").click();
    await page.goto("/cart");
    await expect(page.getByTestId("cart-item-1")).toBeVisible();
    await expect(page.getByTestId("cart-item-2")).toBeVisible();
    await page.getByTestId("checkout-btn").click();
    await expect(page.getByTestId("checkout-success")).toBeVisible({ timeout: 10000 });
  });

  test("updates cart quantity", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("add-to-cart-3").click();
    await page.goto("/cart");
    await page.getByTestId("increase-3").click();
    await expect(page.getByTestId("qty-3")).toHaveText("2");
    await page.getByTestId("decrease-3").click();
    await expect(page.getByTestId("qty-3")).toHaveText("1");
  });

  test("removes item from cart", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("add-to-cart-4").click();
    await page.goto("/cart");
    await page.getByTestId("remove-4").click();
    await expect(page.getByTestId("empty-cart")).toBeVisible();
  });

  test("view order history after checkout", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("add-to-cart-5").click();
    await page.goto("/cart");
    await page.getByTestId("checkout-btn").click();
    await expect(page.getByTestId("checkout-success")).toBeVisible({ timeout: 10000 });
    await page.goto("/orders");
    await expect(page.getByTestId("orders-page")).toBeVisible();
    await expect(page.getByTestId(/^order-/)).toBeVisible();
  });
});
