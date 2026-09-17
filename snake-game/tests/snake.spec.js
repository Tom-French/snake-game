const { test, expect } = require('@playwright/test');

// Basic smoke tests for the Snake demo

test('page loads and shows canvas and score', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#score')).toHaveText('Score: 0');
  await expect(page.locator('canvas')).toBeVisible();
});

test('restart button resets score', async ({ page }) => {
  await page.goto('/');
  // simulate a changed score, then click restart and verify reset
  await page.evaluate(() => document.getElementById('score').textContent = 'Score: 5');
  await page.click('#restart');
  await expect(page.locator('#score')).toHaveText('Score: 0');
});

test('canvas updates when game runs', async ({ page }) => {
  await page.goto('/');
  // capture the canvas bitmap before and after a short wait
  const before = await page.evaluate(() => document.getElementById('game').toDataURL());
  await page.waitForTimeout(350);
  const after = await page.evaluate(() => document.getElementById('game').toDataURL());
  expect(before).not.toBe(after);
});

test('movement keys do not throw errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e));
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
});
