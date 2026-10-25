import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { env } from '../utils/env';

const STORAGE_STATE = 'playwright/.auth/standard_user.json';

// SauceDemo has no token/API endpoint to hit for auth, so the closest equivalent
// to "API-based setup" is: log in once through the real UI here, then persist the
// resulting storageState (cookies + localStorage) to disk. Every spec file then
// starts already authenticated via `use: { storageState }` in playwright.config.ts,
// instead of repeating the login flow as the first three lines of every test.
setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.users.standard.username, env.users.standard.password);
  await loginPage.expectLoggedIn();

  await page.context().storageState({ path: STORAGE_STATE });
});
