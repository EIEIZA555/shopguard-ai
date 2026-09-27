import { test, expect } from "@playwright/test";

test.describe("Shop Page", () => {
  test("displays product catalog", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("shop-title")).toBeVisible();
    await expect(page.getByTestId("product-card-1")).toBeVisible();
    await expect(page.getByTestId("product-price-1")).toContainText("$");
  });

  test("adds product to cart", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("add-to-cart-1").click();
    await page.goto("/cart");
    await expect(page.getByTestId("cart-item-1")).toBeVisible();
    await expect(page.getByTestId("cart-total")).toContainText("$");
  });
});
