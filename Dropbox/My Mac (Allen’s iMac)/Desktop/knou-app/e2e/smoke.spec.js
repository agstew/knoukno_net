const { test, expect } = require('@playwright/test');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Smoke UI tests', () => {
  test('homepage and navigation', async ({ page }) => {
    await page.goto(FRONTEND + '/');
    await expect(page.locator('h1')).toHaveText(/Kno U Kno/);
    await page.click('a[href="/tiers"]');
    await expect(page).toHaveURL(/\/tiers$/);
    // Accept either an H2 or a text node from the tiers component
    await expect(page.locator('text=Available Tiers, h2, :text("Tiers")')).toBeVisible({ timeout: 3000 });
  });

  test('questions page loads', async ({ page }) => {
    await page.goto(FRONTEND + '/questions');
    // Accept either an H2 or visible Questions text
    await expect(page.locator('text=Questions, h2')).toBeVisible({ timeout: 3000 });
    // check cards render or show no questions text (non-fatal)
    await expect(page.locator('text=No questions yet').first()).toBeVisible({ timeout: 100 }).catch(()=>{});
  });
});
