import { expect, type Locator, type Page } from '@playwright/test';
import type { CheckoutInfo } from '../test-data/factory';

export class CheckoutPage {
  readonly page: Page;

  // step one: information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly checkoutError: Locator;

  // step two: overview
  readonly finishButton: Locator;
  readonly summaryItems: Locator;

  // step three: complete
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.checkoutError = page.locator('[data-test="error"]');

    this.finishButton = page.locator('[data-test="finish"]');
    this.summaryItems = page.locator('.cart_item');

    this.completeHeader = page.locator('.complete-header');
  }

  // --- actions ---
  async fillInfo(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
    await this.continueButton.click();
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async completeCheckout(info: CheckoutInfo): Promise<void> {
    await this.fillInfo(info);
    await this.finishOrder();
  }

  // --- assertions ---
  async expectInfoError(message: string | RegExp): Promise<void> {
    await expect(this.checkoutError).toBeVisible();
    await expect(this.checkoutError).toContainText(message);
  }

  async expectOnOverview(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  async expectOverviewItemCount(count: number): Promise<void> {
    await expect(this.summaryItems).toHaveCount(count);
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
