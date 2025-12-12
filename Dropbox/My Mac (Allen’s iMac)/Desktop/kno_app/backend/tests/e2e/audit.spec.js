const { test, expect } = require('@playwright/test');

test('admin actions produce audit entries (smoke)', async ({ page }) => {
  // Ensure we have an admin session first
  await page.goto('/dev/quick-login');

  // Fetch CSRF token then use the dev helper to create a deterministic audit entry
  const csrfToken = await page.evaluate(async () => {
    const r = await fetch('/auth/csrf-token', { credentials: 'same-origin' });
    const j = await r.json();
    return j && j.csrfToken;
  });

  const createRes = await page.evaluate(async (args) => {
    const { csrf, secret } = args || {};
    const body = new URLSearchParams();
    body.append('_csrf', csrf || '');
    body.append('action', 'e2e_test_create_audit');
    body.append('targetEmail', `audit-test-${Date.now()}@example.com`);
    if (secret) body.append('secret', secret);
    const r = await fetch('/dev/create-audit', { method: 'POST', body, credentials: 'same-origin' });
    return r.ok;
  }, { csrf: csrfToken, secret: process.env.DEV_E2E_SECRET || '' });
  expect(createRes).toBe(true);

  // Now visit the audit page and assert the new audit row appears
  await page.goto('/admin/audit');
  const entry = page.locator('tbody tr:has-text("e2e_test_create_audit")');
  await expect(entry.first()).toBeVisible({ timeout: 6000 });
});
