import { test } from '../fixtures/fixtures';
import { env } from '../utils/env';

// problem_user is SauceDemo's deliberately broken account. These tests assert the
// CORRECT behaviour and are marked test.fail(): they pass while the bug exists and
// turn red the day it is fixed, prompting us to drop the annotation. That documents
// known defects without leaving a permanently red suite or hard-coding broken output.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('problem_user (known defects)', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(env.users.problem.username, env.users.problem.password);
    await loginPage.expectLoggedIn();
  });

  test('can log in and see the full product list', async ({ inventoryPage }) => {
    await inventoryPage.expectItemVisible('Sauce Labs Backpack');
  });

  test('each product shows its own image', async ({ inventoryPage }) => {
    test.fail(true, 'Known bug: every product renders the same placeholder image');
    await inventoryPage.expectUniqueProductImages();
  });

  test('sorting Z to A reorders the products', async ({ inventoryPage }) => {
    test.fail(true, 'Known bug: the sort dropdown does not reorder items');
    await inventoryPage.sortBy('za');
    await inventoryPage.expectNamesSorted('desc');
  });

  test('checkout accepts valid customer details', async ({ inventoryPage, cartPage, checkoutPage, checkoutInfo }) => {
    test.fail(true, 'Known bug: the last name field is not populated, so checkout is rejected');
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillInfo(checkoutInfo);
    await checkoutPage.expectOnOverview();
  });
});
