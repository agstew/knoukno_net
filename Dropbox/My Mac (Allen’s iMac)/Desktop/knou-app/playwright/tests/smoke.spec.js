const { test, expect } = require('@playwright/test');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Smoke UI tests', () => {
  async function waitForAny(page, selectors, timeout = 15000){
    const start = Date.now();
    while(Date.now() - start < timeout){
      for(const s of selectors){
        const n = await page.locator(s).count();
        if (n && n > 0) return true;
      }
      await page.waitForTimeout(300);
    }
    return false;
  }

  test('homepage and navigation', async ({ page }) => {
    await page.goto(FRONTEND + '/');
    await expect(page.locator('h1')).toHaveText(/Kno U Kno/);
    await page.click('a[href="/tiers"]');
    await expect(page).toHaveURL(/\/tiers$/);
    const body = await page.locator('body').count();
    expect(body).toBeGreaterThan(0);
  });

  test('questions page loads', async ({ page }) => {
    await page.goto(FRONTEND + '/questions');
    await expect(page).toHaveURL(/\/questions$/);
    const body = await page.locator('body').count();
    expect(body).toBeGreaterThan(0);
  });
});
