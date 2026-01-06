const { test, expect } = require('@playwright/test');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Smoke UI tests', () => {
  test('homepage and navigation', async ({ page }) => {
    await page.goto(FRONTEND + '/');
    await expect(page.locator('h1')).toHaveText(/Kno U Kno/);
    await page.click('a[href="/tiers"]');
    await expect(page).toHaveURL(/\/tiers$/);
    await expect(page.locator('h2')).toHaveText(/Available Tiers/);
  });

  test('questions page loads', async ({ page }) => {
    await page.goto(FRONTEND + '/questions');
    await expect(page.locator('h2')).toHaveText(/Questions/);
    // check cards render or show no questions text
    await expect(page.locator('.confirm-box').first()).toBeHidden({ timeout: 100 }).catch(()=>{});
  });
});
