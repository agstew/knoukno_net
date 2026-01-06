const { test, expect } = require('@playwright/test');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Smoke UI tests', () => {
  async function waitForAny(page, selectors, timeout = 5000){
    const start = Date.now();
    while(Date.now() - start < timeout){
      for(const s of selectors){
        const n = await page.locator(s).count();
        if (n && n > 0) return true;
      }
      await page.waitForTimeout(200);
    }
    return false;
  }

  test('homepage and navigation', async ({ page }) => {
    await page.goto(FRONTEND + '/');
    await expect(page.locator('h1')).toHaveText(/Kno U Kno/);
    await page.click('a[href="/tiers"]');
    await expect(page).toHaveURL(/\/tiers$/);
    // Accept a few possible selectors to prove page rendered
    const ok = await waitForAny(page, ['text=Available Tiers', 'h2', 'text=Tiers'], 5000);
    expect(ok).toBeTruthy();
  });

  test('questions page loads', async ({ page }) => {
    await page.goto(FRONTEND + '/questions');
    const ok = await waitForAny(page, ['text=Questions', 'h2', 'text=No questions yet'], 5000);
    expect(ok).toBeTruthy();
  });
});
