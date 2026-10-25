import { test } from '../fixtures/fixtures';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Cart and inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('adding items updates the badge and the cart contents', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.addItemToCart(BIKE_LIGHT);
    await inventoryPage.expectCartCount(2);

    await inventoryPage.openCart();
    await cartPage.expectItemCount(2);
    await cartPage.expectItemInCart(BACKPACK);
    await cartPage.expectItemInCart(BIKE_LIGHT);
  });

  test('removing an item from the inventory page clears the badge', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.expectCartCount(1);

    await inventoryPage.removeItemFromCart(BACKPACK);
    await inventoryPage.expectCartCount(0);
  });

  test('removing an item inside the cart leaves the others', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.addItemToCart(BIKE_LIGHT);
    await inventoryPage.openCart();

    await cartPage.removeItem(BACKPACK);
    await cartPage.expectItemNotInCart(BACKPACK);
    await cartPage.expectItemInCart(BIKE_LIGHT);
  });

  test('cart contents survive a page reload', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await page.reload();
    await inventoryPage.expectCartCount(1);

    await inventoryPage.openCart();
    await cartPage.expectItemInCart(BACKPACK);
  });

  test('sorts by name A to Z and Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    await inventoryPage.expectNamesSorted('asc');

    await inventoryPage.sortBy('za');
    await inventoryPage.expectNamesSorted('desc');
  });

  test('sorts by price low to high and high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    await inventoryPage.expectPricesSorted('asc');

    await inventoryPage.sortBy('hilo');
    await inventoryPage.expectPricesSorted('desc');
  });
});
