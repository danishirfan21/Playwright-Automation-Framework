import { test, expect } from '@playwright/test';

test('deliberate failure to verify merged report upload', async () => {
  expect(1).toBe(2);
});
