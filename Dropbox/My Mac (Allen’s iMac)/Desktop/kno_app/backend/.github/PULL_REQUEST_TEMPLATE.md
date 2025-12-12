<!-- PR template for backend changes in this branch -->
Title: test(e2e): add deterministic audit E2E and dev helper

Description
---
Adds a dev-only `/dev/create-audit` helper (CSRF-protected and optionally guarded by `DEV_E2E_SECRET`) that creates audit entries for deterministic E2E tests. Includes `tests/e2e/audit.spec.js` which uses `/dev/create-audit` to verify the admin audit UI.

Files changed
- `backend/server.js`: add `/dev/create-audit` (dev-only) with optional secret guard.
- `backend/tests/e2e/audit.spec.js`: update to call helper with CSRF and optional secret.

Why
---
Avoid flaky timing/state dependencies in CI by creating deterministic audit records for UI verification.

How to create the PR locally with GitHub CLI
---
```bash
cd /Users/allengregorystewart/Dropbox/My\ Mac\ \(Allen’s\ iMac\)/Desktop/kno_app/backend
gh pr create --fill --head dev/e2e-capture --title "test(e2e): add deterministic audit E2E and dev helper" --body-file .github/PULL_REQUEST_TEMPLATE.md
```

Web alternative (open in browser):
https://github.com/agstew/allengregorystewart/pull/new/dev/e2e-capture
