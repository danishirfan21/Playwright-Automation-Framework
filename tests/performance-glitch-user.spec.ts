import { test } from '../fixtures/fixtures';
import { env } from '../utils/env';

// performance_glitch_user is SauceDemo's account with a ~5s delay on login. Measured locally,
// the URL changes after ~5.1s and the list renders within ~100ms of that. In CI run
// 40434734827 one attempt matched the URL but then found no product within the default 5s
// expect timeout, which that measurement does not explain (root cause unconfirmed; the run's
// traces had expired). So the post-login wait for the list gets the same explicit, local
// budget as the URL check; everything after it uses the defaults, so a genuine slowdown
// elsewhere still fails the test.
const SLOW_LOGIN_TIMEOUT = 20_000;

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('performance_glitch_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(env.users.performanceGlitch.username, env.users.performanceGlitch.password);
    await loginPage.expectLoggedIn({ timeout: SLOW_LOGIN_TIMEOUT });
  });

  test('logs in despite the delay and sees the product list', async ({ inventoryPage }) => {
    await inventoryPage.expectItemVisible('Sauce Labs Backpack', { timeout: SLOW_LOGIN_TIMEOUT });
  });

  test('can add an item to the cart', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.expectCartCount(1);
  });
});
