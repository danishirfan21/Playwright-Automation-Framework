# SauceDemo Playwright Framework

End-to-end test framework for [saucedemo.com](https://www.saucedemo.com), built with Playwright and TypeScript.

## Setup

```bash
npm install
npx playwright install chromium   # add firefox webkit for all browsers
cp .env.example .env              # optional; defaults point at saucedemo.com
```

## Running tests

```bash
npm test                              # all projects
npx playwright test --project=chromium
npm run test:headed                   # watch the browser
npm run test:ui                       # Playwright UI mode
npm run test:debug                    # step through with the Inspector
npm run report                        # open the last HTML report
npm run typecheck
```

## Structure

| Folder | Purpose |
|---|---|
| `tests/` | Specs (`login`, `cart`, `checkout`) and `auth.setup.ts` |
| `pages/` | Page objects: readonly locators, action methods, separate `expect*` assertion methods |
| `fixtures/` | Custom `test` that injects page objects and generated test data |
| `test-data/` | Faker-backed data factory |
| `utils/` | Typed env var access |

## Key design decisions

- **Auth via a setup project.** `auth.setup.ts` logs in once and saves `storageState`; the browser projects depend on it, so tests start authenticated. SauceDemo has no auth API, so this is the UI-login equivalent of an API token fixture. Login specs override `storageState` to start logged out.
- **Fixtures over global setup.** Each test gets isolated page objects and fresh data, with automatic teardown.
- **Retries:** 0 locally, 2 on CI (`CI` env var). CI uses 4 workers per shard.
- **POM split:** actions mutate state, `expect*` methods assert. Tests contain no raw locators.

## Configuration

| Variable | Default |
|---|---|
| `BASE_URL` | `https://www.saucedemo.com` |
| `STANDARD_USER` / `LOCKED_OUT_USER` / `PROBLEM_USER` / `PERFORMANCE_GLITCH_USER` / `ERROR_USER` / `VISUAL_USER` | SauceDemo's public demo usernames |
| `STANDARD_PASSWORD` | SauceDemo's public demo password |

## CI

`.github/workflows/playwright.yml` runs on pull requests, splits the suite across 4 shards, and each shard uploads a blob report (`blob-report-N`). A final `merge-reports` job combines them into one HTML report, uploaded as `playwright-html-report` when any shard fails (kept 14 days).
