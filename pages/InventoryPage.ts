import { expect, type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly inventoryItems: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  private itemByName(name: string): Locator {
    return this.inventoryItems.filter({ hasText: name });
  }

  // --- actions ---
  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async addItemToCart(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeItemFromCart(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  // --- assertions ---
  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toBeHidden();
      return;
    }
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectItemVisible(name: string): Promise<void> {
    await expect(this.itemByName(name)).toBeVisible();
  }

  async expectNamesSorted(direction: 'asc' | 'desc'): Promise<void> {
    const names = this.page.locator('.inventory_item_name');
    await expect(names.first()).toBeVisible();
    const expected = [...(await names.allTextContents())].sort((a, b) => a.localeCompare(b));
    if (direction === 'desc') expected.reverse();
    await expect(names).toHaveText(expected);
  }

  async expectPricesSorted(direction: 'asc' | 'desc'): Promise<void> {
    const prices = this.page.locator('.inventory_item_price');
    await expect(prices.first()).toBeVisible();
    const actual = (await prices.allTextContents()).map((p) => Number(p.replace('$', '')));
    const expected = [...actual].sort((a, b) => a - b);
    if (direction === 'desc') expected.reverse();
    expect(actual).toEqual(expected);
  }
}
