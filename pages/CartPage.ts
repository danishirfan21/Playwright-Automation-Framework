import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  private itemByName(name: string): Locator {
    return this.cartItems.filter({ hasText: name });
  }

  // --- actions ---
  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  async removeItem(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  // --- assertions ---
  async expectItemInCart(name: string): Promise<void> {
    await expect(this.itemByName(name)).toBeVisible();
  }

  async expectItemNotInCart(name: string): Promise<void> {
    await expect(this.itemByName(name)).toHaveCount(0);
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }
}
