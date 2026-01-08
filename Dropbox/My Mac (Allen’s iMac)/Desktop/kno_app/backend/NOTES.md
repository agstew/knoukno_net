# Backend Notes — Kno U Kno

Summary
- Built core backend: authentication (JWT, bcrypt), questions, submissions, and admin endpoints (grade, rate, save, bulk actions).
- Seed script creates 525 questions total (175 per category). See `seed.js`.
- Stripe Checkout scaffolded; `/payments/create-checkout-session` and `/webhook` present. Webhook verifies signatures when `STRIPE_WEBHOOK_SECRET` is set.
- Tests: Jest + Supertest integration tests added and passing locally (uses `mongodb-memory-server`).

Important files
- `server.js` — exports the Express `app` for testing and conditionally listens.
- `seed.js` — seeds questions (525 total).
- `scripts/send_test_webhook.js` — unsigned, quick smoke POST to `/webhook`.
- `scripts/send_signed_webhook.js` — generates Stripe-style `Stripe-Signature` header and can POST signed payloads.
- `views/layout.pug`, `public/header.js`, `public/styles.css` — header/admin UI and Save All AJAX behavior.
- `middleware/validators.js` — request validation rules wired into routes.

How to run locally
1. Install and configure
   - cd `backend`
   - copy `.env.example` → `.env` and set `MONGO_URI`, `JWT_SECRET`. For Stripe testing set `STRIPE_*` values.
2. Install deps
```bash
npm install
```
3. Seed DB (creates 525 questions)
```bash
npm run seed
```
4. Start server
```bash
npm run dev
```
5. Run tests / coverage (uses in-memory MongoDB)
```bash
npm test
npm run coverage
```

Webhook testing
- Recommended: use the Stripe CLI to forward signed events:
```bash
stripe listen --forward-to localhost:3000/webhook
```
Copy the `webhook signing secret` shown by the CLI to `STRIPE_WEBHOOK_SECRET`.
- For signed local tests without Stripe CLI, use:
```bash
node backend/scripts/send_signed_webhook.js --secret=whsec_test --url=http://localhost:3000/webhook --send
```
- For a quick unsigned POST (no signature), use:
```bash
node backend/scripts/send_test_webhook.js
```

CI and coverage
- GitHub Actions workflow runs tests and coverage. The Codecov upload step is conditional — add `CODECOV_TOKEN` to repo secrets to enable uploads.

Next recommended steps
- Add `CODECOV_TOKEN` to repository secrets to enable coverage upload in CI.
- Provide Stripe test keys and run `stripe listen` (or expose the server via ngrok) to verify full Checkout + webhook flows.
- Consider adding CSRF protection to form endpoints and hardening cookie settings for production.
- Optional: add more integration tests covering pricing/stripe flows and UI end-to-end tests.

Contact
- If you want, I can open a PR with these notes, add the optional CI/PR checks, or implement CSRF & webhook E2E automation next.
