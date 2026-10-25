import { test } from '../fixtures/fixtures';
import { env } from '../utils/env';

// Login tests must start unauthenticated, so override the cached session from the config.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('valid user lands on the inventory page', async ({ loginPage }) => {
    await loginPage.login(env.users.standard.username, env.users.standard.password);
    await loginPage.expectLoggedIn();
  });

  test('locked-out user sees a lockout error', async ({ loginPage }) => {
    await loginPage.login(env.users.lockedOut.username, env.users.lockedOut.password);
    await loginPage.expectLoginError('Sorry, this user has been locked out');
  });

  test('wrong password is rejected', async ({ loginPage }) => {
    await loginPage.login(env.users.standard.username, 'not_the_password');
    await loginPage.expectLoginError('Username and password do not match');
  });

  test('empty username is rejected', async ({ loginPage }) => {
    await loginPage.login('', env.users.standard.password);
    await loginPage.expectLoginError('Username is required');
  });

  test('empty password is rejected', async ({ loginPage }) => {
    await loginPage.login(env.users.standard.username, '');
    await loginPage.expectLoginError('Password is required');
  });
});
