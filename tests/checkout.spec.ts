import { test } from '../fixtures/fixtures';
import { buildCheckoutInfo } from '../test-data/factory';

const BACKPACK = 'Sauce Labs Backpack';

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
  });

  test('completes an order with valid details', async ({ checkoutPage, checkoutInfo }) => {
    await checkoutPage.fillInfo(checkoutInfo);
    await checkoutPage.expectOnOverview();
    await checkoutPage.expectOverviewItemCount(1);

    await checkoutPage.finishOrder();
    await checkoutPage.expectOrderComplete();
  });

  test('rejects a missing first name', async ({ checkoutPage }) => {
    await checkoutPage.fillInfo(buildCheckoutInfo({ firstName: '' }));
    await checkoutPage.expectInfoError('First Name is required');
  });

  test('rejects a missing last name', async ({ checkoutPage }) => {
    await checkoutPage.fillInfo(buildCheckoutInfo({ lastName: '' }));
    await checkoutPage.expectInfoError('Last Name is required');
  });

  test('rejects a missing postal code', async ({ checkoutPage }) => {
    await checkoutPage.fillInfo(buildCheckoutInfo({ postalCode: '' }));
    await checkoutPage.expectInfoError('Postal Code is required');
  });
});
