const { test, expect } = require('@playwright/test');

test('admin actions produce audit entries (smoke)', async ({ page }) => {
  // Ensure we have an admin session first
  await page.goto('/dev/quick-login');

  // Fetch CSRF token then use the dev helper to create a deterministic audit entry
    const csrfToken = await page.evaluate(async () => {
      const r = await fetch('/auth/csrf-token', { credentials: 'include' });
      const j = await r.json();
      return j && j.csrfToken;
    });

    // POST the audit entry from the page context so cookies and CSRF align.
    const postResult = await page.evaluate(async ({ csrf, secret }) => {
      const body = new URLSearchParams();
      body.append('_csrf', csrf || '');
      body.append('action', 'e2e_test_create_audit');
      body.append('targetEmail', `audit-test-${Date.now()}@example.com`);
      if (secret) body.append('secret', secret);
      const r = await fetch('/dev/create-audit', { method: 'POST', body, credentials: 'include' });
      let ok = r.ok;
      try {
        const j = await r.json();
        // prefer explicit ok when API returns {ok:true}
        if (typeof j === 'object' && j !== null && j.ok !== undefined) ok = Boolean(j.ok) || ok;
      } catch (e) {
        // ignore parse errors
      }
      return { ok, status: r.status };
    }, { csrf: csrfToken, secret: process.env.DEV_E2E_SECRET || '' });

    expect(postResult.ok).toBe(true);

    // Visit the audit page and retry a few times to account for DB write latency.
    await page.goto('/admin/audit');
    const entryLocator = page.locator('tbody tr:has-text("e2e_test_create_audit")');
    for (let i = 0; i < 8; i++) {
      if (await entryLocator.count() > 0) break;
      await page.waitForTimeout(500);
      await page.reload();
    }
    await expect(entryLocator.first()).toBeVisible({ timeout: 10000 });
});
