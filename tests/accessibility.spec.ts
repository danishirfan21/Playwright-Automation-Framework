import { test } from '../fixtures/fixtures';

test.describe('accessibility', () => {
  test.describe('login page', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('has no WCAG A/AA violations', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.expectNoAccessibilityViolations();
    });
  });

  test('inventory page has no WCAG A/AA violations', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectNoAccessibilityViolations();
  });
});
