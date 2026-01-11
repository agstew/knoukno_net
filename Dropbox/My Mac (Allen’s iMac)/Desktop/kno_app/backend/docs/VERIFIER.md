# CSRF-aware Admin Verifier

Purpose
- Programmatic verifier to exercise admin UI endpoints safely during development and CI. Designed to be dry-run by default and require an explicit `EXECUTE=1` to perform guarded POSTs.

Usage

Start the backend dev server (dev HTTPS if used):

```bash
DEV_HTTPS=true PORT=3000 node backend/server.js
```

Run verifier (dry-run, preserves tmp artifacts when requested):

```bash
# dry-run, preserve TMPDIR artifacts
PRESERVE_TMP=1 bash backend/scripts/verify_admin_links.sh

# to perform guarded POSTs (USE WITH CAUTION)
PRESERVE_TMP=1 EXECUTE=1 bash backend/scripts/verify_admin_links.sh
```

Flags
- `PRESERVE_TMP=1` — keep temporary artifacts (cookies, HTML, results) for debugging.
- `EXECUTE=1` — actually perform POSTs that modify server state. Default is dry-run (no writes).
- `CURL_DEBUG=1` — enable verbose curl output.

CI Integration
- The repository includes `.github/workflows/verify-admin.yml` which runs the verifier in dry-run on PRs. The workflow requires the repository secrets `ADMIN_EMAIL` and `ADMIN_PASSWORD` to authenticate as an admin in CI.
- The workflow uploads verifier artifacts as job artifacts for inspection; do NOT commit sensitive artifacts into the repo.

Safety Notes
- The verifier extracts the page-specific CSRF token before performing any POST. Re-using the login-page CSRF token for other pages will fail; the script handles per-page token extraction.
- Use `EXECUTE=1` only in controlled environments (local dev or disposable test environments). The CI workflow runs dry-run only.

Archiving
- Local preserved TMPDIR artifacts should be archived outside the repository (CI artifact storage is preferred). See `backend/scripts/CLEANUP.md` for cleanup guidance.
