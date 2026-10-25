import { defineConfig, devices } from '@playwright/test';
import { env } from './utils/env';

const STORAGE_STATE = 'playwright/.auth/standard_user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.isCI,

  // Local: fail fast, iterate quickly. CI: flakiness is expensive to re-triage
  // manually, and a genuine regression should reproduce on a clean retry, so we
  // spend a bit of CI time to avoid false-red builds on transient timing issues.
  retries: env.isCI ? 2 : 0,

  // CI runners are typically 2-core and oversubscribing workers just causes
  // resource contention/timeouts. Locally we use most of the machine's cores
  // (Playwright's default) since a dev machine isn't shared with other jobs.
  workers: env.isCI ? 4 : undefined,

  reporter: env.isCI
    ? [['html', { open: 'never' }], ['github'], ['list']]
    : [['html', { open: 'on-failure' }], ['list']],

  use: {
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    // Runs first, logs in once via the UI, and caches storageState to disk.
    // Every other project declares it as a dependency instead of re-authenticating
    // per test/browser, so login happens once per run, not once per test.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
});
