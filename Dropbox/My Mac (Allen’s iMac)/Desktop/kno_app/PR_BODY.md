PR: Merge `feature/submissions-and-tests` → `agstew-knoukno`

Title: Harden admin verifier, fix backend crash, add frontend tests, CI verifier workflow

Summary:
- Fix: resolved backend crash related to `ObjectId` construction in `backend/routes/admin.js`.
- Add: CSRF-aware admin verifier script; supports dry-run (`EXECUTE=0`) and guarded POSTs (`EXECUTE=1`). Preserves TMP artifacts when `PRESERVE_TMP=1`.
- Add: frontend Vitest smoke test and test infra.
- Add: CI workflow `.github/workflows/verify-admin.yml` to run verifier in dry-run on PRs (requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` secrets).
- Add: archive of recent verifier artifacts under `backend/scripts/archive/` for debugging provenance.

What to review:
- Confirm backend template changes are safe for production rendering.
- Check `verify_admin_links.sh` flags and dry-run behavior; CI will run dry-run only.
- Decide whether to keep `backend/scripts/archive/` artifacts in repo; recommended: remove from repo and rely on CI artifact uploads.

How to run locally:
```bash
# start backend (dev https if used)
DEV_HTTPS=true PORT=3000 node backend/server.js

# run verifier dry-run and preserve tmp artifacts
PRESERVE_TMP=1 bash backend/scripts/verify_admin_links.sh

# to execute guarded POSTs (USE WITH CAUTION)
PRESERVE_TMP=1 EXECUTE=1 bash backend/scripts/verify_admin_links.sh
```

CI notes:
- Add `ADMIN_EMAIL` and `ADMIN_PASSWORD` repository secrets before merging to allow the workflow to execute.
