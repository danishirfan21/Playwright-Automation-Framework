import { expect, type Locator, type Page } from '@playwright/test';
import { expectNoAccessibilityViolations } from '../utils/accessibility';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  // --- actions ---
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // --- assertions ---
  async expectLoginError(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectLoggedIn(options?: { timeout?: number }): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/, options);
  }

  async expectNoAccessibilityViolations(): Promise<void> {
    await expectNoAccessibilityViolations(this.page);
  }
}
