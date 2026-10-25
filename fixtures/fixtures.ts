import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { buildCheckoutInfo, type CheckoutInfo } from '../test-data/factory';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  checkoutInfo: CheckoutInfo;
};

// Fixtures over a global setup script for three reasons:
// 1. Dependency injection, not test-order coupling. A global setup script runs
//    once before the whole suite and mutates shared state; fixtures give each
//    test an isolated instance, so tests can run in any order or in parallel
//    workers without fighting over the same object.
// 2. Automatic, declarative cleanup. Anything after the `use()` in a fixture
//    runs as teardown for that test even if the test fails — no afterEach
//    bookkeeping, no forgetting to reset state.
// 3. Composability. A test only pulls in the fixtures it actually needs
//    (e.g. a login-flow test doesn't need `checkoutPage`), which keeps each
//    spec file's dependencies visible in its function signature instead of
//    hidden in a shared beforeEach.
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // A fresh, unique record per test — avoids cross-test collisions when tests
  // run in parallel, and keeps the "what data does this test use" question
  // answered by the factory, not copy-pasted literals in the test body.
  // Playwright requires an object-destructuring first argument to detect fixture dependencies.
  // eslint-disable-next-line no-empty-pattern
  checkoutInfo: async ({}, use) => {
    await use(buildCheckoutInfo());
  },
});

export { expect } from '@playwright/test';
