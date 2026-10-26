# SauceDemo Playwright Framework

[![Playwright Tests](https://github.com/danishirfan21/Playwright-Automation-Framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/danishirfan21/Playwright-Automation-Framework/actions/workflows/playwright.yml)

End-to-end test framework for [saucedemo.com](https://www.saucedemo.com), built with Playwright and TypeScript. Covers the standard login/cart/checkout flow plus SauceDemo's other demo accounts (`problem_user`, `error_user`, `visual_user`, `performance_glitch_user`), each of which exercises a different class of known UI bug, and WCAG accessibility checks via axe-core.

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
npm run lint
```

## Structure

| Folder | Purpose |
|---|---|
| `tests/` | Specs (`login`, `cart`, `checkout`, `accessibility`, and the `problem`/`error`/`visual`/`performance_glitch` user suites) and `auth.setup.ts` |
| `pages/` | Page objects: readonly locators, action methods, separate `expect*` assertion methods |
| `fixtures/` | Custom `test` that injects page objects and generated test data |
| `test-data/` | Faker-backed data factory |
| `utils/` | Typed env var access |
| `.claude/agents/` | `test-impact-reviewer`: a Claude Code sub-agent (Read/Grep/Glob only, no Bash) that statically traces a `pages/`/`fixtures/` diff to the specs it affects — including transitively through page-object method chains — for use in code review |

## Test coverage

Beyond the standard `standard_user` login/cart/checkout path:

| Account | What it covers |
|---|---|
| `problem_user` | Broken product images, a non-functional sort dropdown, and a checkout form that silently drops the last name field |
| `error_user` | "Add to cart" that no-ops for some products, sorting that throws instead of reordering, and checkout that never completes |
| `visual_user` | Visual regressions; asserted via product prices (reliably checkable text) rather than screenshot diffing, which is brittle across CI environments |
| `performance_glitch_user` | A slow login — only the post-login assertion gets an extended timeout, so a genuine slowdown anywhere else still fails the test |

Each of these is a **known SauceDemo defect**, not a framework bug: the specs assert the *correct* behavior and are marked `test.fail(true, reason)`, so they pass while the bug exists (documenting it) and turn red — flagging a regression to investigate — the moment SauceDemo fixes it.

`accessibility.spec.ts` runs axe-core (`@axe-core/playwright`) WCAG A/AA checks against the login and inventory pages.

## Key design decisions

- **Auth via a setup project.** `auth.setup.ts` logs in once and saves `storageState`; the browser projects depend on it, so tests start authenticated. SauceDemo has no auth API, so this is the UI-login equivalent of an API token fixture. Login specs override `storageState` to start logged out.
- **Fixtures over global setup.** Each test gets isolated page objects and fresh data, with automatic teardown.
- **Retries:** 0 locally, 2 on CI (`CI` env var). CI uses 4 workers per shard.
- **POM split:** actions mutate state, `expect*` methods assert. Tests contain no raw locators.
- **Known defects as `test.fail()`, not skips.** `visual_user`, `error_user`, and `problem_user` specs assert the *correct* behavior rather than being skipped or deleted — they document the bug and self-promote to a real failure (and a CI-visible regression signal) the day it's fixed.
- **Pinned container, not ad-hoc browser installs.** CI runs tests inside `mcr.microsoft.com/playwright:v1.63.0-noble`, pinned to the exact `@playwright/test` version in `package.json`. This avoids both the flaky apt mirror that ad-hoc `playwright install` hits on fresh runners and version drift between the installed browsers and the test runner.

## Configuration

| Variable | Default |
|---|---|
| `BASE_URL` | `https://www.saucedemo.com` |
| `STANDARD_USER` / `LOCKED_OUT_USER` / `PROBLEM_USER` / `PERFORMANCE_GLITCH_USER` / `ERROR_USER` / `VISUAL_USER` | SauceDemo's public demo usernames |
| `STANDARD_PASSWORD` | SauceDemo's public demo password |

## CI

`.github/workflows/playwright.yml` runs on every pull request and on pushes to `main`:

- **`lint`** — ESLint + `tsc --noEmit`.
- **`test`** — the suite split across 4 shards, run inside the pinned Playwright container; each shard uploads a blob report (`blob-report-N`).
- **`merge-reports`** — combines the shard reports into one HTML report, uploaded as `playwright-html-report` when any shard fails (kept 14 days).

`main` is protected: changes land via pull request, and all 6 jobs above must pass before merging.
