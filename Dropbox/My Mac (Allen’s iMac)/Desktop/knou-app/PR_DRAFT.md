Title: Add dev scripts, Questions UI, webhook helper, and UI polish

Summary:
- Implemented full backend webhook handling and testing helper.
- Added Questions UI with answer submission and subscription gating.
- Improved frontend UX: accessible toasts, confirm modal, spinner states, form validation and styles.
- Added Playwright smoke E2E tests covering basic navigation and pages.
- Improved `scripts/start-ngrok-webhook.js` to fallback to cloudflared when ngrok fails and emit clear diagnostics.

Testing steps:
1. Run `npm run seed` to seed DB.
2. Start backend: `export PORT=5050 && node server.js` (set `STRIPE_WEBHOOK_SECRET` in session for webhook testing).
3. Build & serve frontend: `cd frontend && npm start` or `npx serve -s frontend/build -l 3000`.
4. Run Playwright tests: `npx playwright test`.

Checklist:
- [ ] Backend tests pass
- [ ] Playwright smoke tests pass locally
- [ ] Stripe webhook verified locally (signing secret available)

Notes:
- No secrets written to `.env`; webhook secrets can be provided at runtime via environment variables.
- Prefer to set default branch to `agstew-knoukno` and open PR against it.
