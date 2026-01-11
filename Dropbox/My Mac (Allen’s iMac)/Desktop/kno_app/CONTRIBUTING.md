# Contributing

Short checklist for contributors and maintainers:

- Run tests locally before opening PRs:

```bash
cd backend && npm ci && npm test
cd ../frontend && npm ci && npm test
```

- Verifier: follow `backend/docs/VERIFIER.md` to run the CSRF-aware admin verifier in dry-run.
- CI: ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` repository secrets are added before enabling verifier CI runs.
- Cleanup: avoid committing local artifacts (see `backend/scripts/CLEANUP.md`).

PRs
- Open PRs against the default branch `agstew-knoukno`. Use `PR_BODY.md` at repo root for a template for this feature branch.
