# Kno U Kno

Development notes

- Run the backend locally:

```bash
cd backend
npm install
npm start
```

- Run the backend E2E smoke test (local):

```bash
# from repository root
npm run e2e
```

This runs `scripts/e2e-smoke.js` which exercises CSRF, auth, question and answer flows against `http://localhost:3000`.

CI

- A GitHub Actions workflow `.github/workflows/e2e-smoke.yml` runs the E2E smoke test on push and pull requests. The workflow installs root dependencies, installs backend dependencies, starts the backend (using an in-memory MongoDB), waits for readiness, then runs `npm run e2e`.

E2E & CSRF smoke test (local)

- A quick smoke script is available at `scripts/smoke_csrf.sh` to help reproduce and debug CSRF issues locally. It:
	- GETs `/auth/csrf-token` and saves the cookie jar to `backend/cookies.txt` and the token to `backend/csrf.json`.
	- POSTs `/auth/login` using the same cookie jar and `_csrf` form field.

Usage:
```bash
# from repository root
chmod +x scripts/smoke_csrf.sh
./scripts/smoke_csrf.sh you@example.com badpassword
```

CI (Playwright)

- The repository includes a Playwright E2E workflow at `.github/workflows/playwright-e2e.yml` which:
	- installs backend dependencies, installs Playwright browsers, and starts the backend
	- requires a repository secret `DEV_E2E_SECRET` (set via GitHub repo Settings → Secrets) if the dev-only `/dev/create-audit` helper is guarded
	- waits for `http://localhost:3000/ready` before running `npx playwright test` in `backend`

If you want me to add instructions to set the `DEV_E2E_SECRET` in your repo, tell me and I will provide the exact steps.
