import { test } from '../fixtures/fixtures';
import { env } from '../utils/env';

// visual_user is SauceDemo's account with visual defects. Prices are the reliably
// detectable one, so that is asserted; it is marked test.fail() like the other
// known-defect specs so it flips red once the bug is fixed.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('visual_user (known defects)', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(env.users.visual.username, env.users.visual.password);
    await loginPage.expectLoggedIn();
  });

  test('can log in and see the full product list', async ({ inventoryPage }) => {
    await inventoryPage.expectItemVisible('Sauce Labs Backpack');
  });

  test('can add an item to the cart', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.expectCartCount(1);
  });

  test('products show their catalogue prices', async ({ inventoryPage }) => {
    test.fail(true, 'Known bug: prices are replaced with random values on every load');
    await inventoryPage.expectPrices({
      'Sauce Labs Backpack': 29.99,
      'Sauce Labs Bike Light': 9.99,
      'Sauce Labs Bolt T-Shirt': 15.99,
      'Sauce Labs Fleece Jacket': 49.99,
      'Sauce Labs Onesie': 7.99,
      'Test.allTheThings() T-Shirt (Red)': 15.99,
    });
  });
});
