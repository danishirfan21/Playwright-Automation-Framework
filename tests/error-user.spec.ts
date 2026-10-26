import { test } from '../fixtures/fixtures';
import { env } from '../utils/env';

// error_user is SauceDemo's account that hits errors in the UI. As with problem_user,
// tests assert the CORRECT behaviour and are marked test.fail() so they document known
// defects and turn red once the bug is fixed.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('error_user (known defects)', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(env.users.error.username, env.users.error.password);
    await loginPage.expectLoggedIn();
  });

  test('can log in and see the full product list', async ({ inventoryPage }) => {
    await inventoryPage.expectItemVisible('Sauce Labs Backpack');
  });

  test('can add an item to the cart', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.expectCartCount(1);
  });

  test('every product can be added to the cart', async ({ inventoryPage }) => {
    test.fail(true, 'Known bug: Add to cart does nothing for some products');
    const names = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ];
    for (const name of names) await inventoryPage.addItemToCart(name);
    await inventoryPage.expectCartCount(names.length);
  });

  test('sorting Z to A reorders the products', async ({ inventoryPage }) => {
    test.fail(true, 'Known bug: sorting raises an error and does not reorder items');
    await inventoryPage.sortBy('za');
    await inventoryPage.expectNamesSorted('desc');
  });

  test('completes an order', async ({ inventoryPage, cartPage, checkoutPage, checkoutInfo }) => {
    test.fail(true, 'Known bug: Finish does not complete the order');
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillInfo(checkoutInfo);
    await checkoutPage.finishOrder();
    await checkoutPage.expectOrderComplete();
  });
});
