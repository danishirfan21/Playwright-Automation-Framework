import { test } from '../fixtures/fixtures';
import { env } from '../utils/env';

// performance_glitch_user is SauceDemo's account with a slow login (a few seconds).
// Only the login assertion gets a longer timeout; everything after it uses the defaults,
// so a genuine slowdown elsewhere still fails the test.
const SLOW_LOGIN_TIMEOUT = 20_000;

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('performance_glitch_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(env.users.performanceGlitch.username, env.users.performanceGlitch.password);
    await loginPage.expectLoggedIn({ timeout: SLOW_LOGIN_TIMEOUT });
  });

  test('logs in despite the delay and sees the product list', async ({ inventoryPage }) => {
    await inventoryPage.expectItemVisible('Sauce Labs Backpack');
  });

  test('can add an item to the cart', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.expectCartCount(1);
  });
});
