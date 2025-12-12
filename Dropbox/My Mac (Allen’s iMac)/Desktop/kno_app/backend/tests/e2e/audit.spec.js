const { test, expect } = require('@playwright/test');

test('admin actions produce audit entries (smoke)', async ({ page }) => {
  // Become admin via dev quick-login
  await page.goto('/dev/quick-login');

  // Visit admin users to get CSRF token and ensure admin session
  await page.goto('/admin/users');

  // Extract the CSRF token from the first delete form on the page
  const csrf = await page.locator('input[name="_csrf"]').first().inputValue();

  // Click the first delete button in the users table to perform a real delete
  // (this should generate an audit entry on the server).
  const delBtn = page.locator('form[action="/admin/users/delete"] button').first();
  // Accept the confirm dialog that appears on delete
  page.on('dialog', async dlg => { await dlg.accept(); });
  await delBtn.click();
  // small delay to allow server work to complete
  await page.waitForTimeout(500);

  // Now visit the audit page and assert at least one audit row exists
  await page.goto('/admin/audit');
  // Wait for either a row or the 'No audit records.' message
  const rows = page.locator('tbody tr');
  await rows.first().waitFor({ timeout: 6000 });
  const firstText = await rows.first().innerText();
  expect(firstText).not.toContain('No audit records.');
});
