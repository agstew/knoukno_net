# Kno U Kno — Backend

Minimal Express + Mongoose backend scaffold for the Kno U Kno app.

Setup
- copy `.env.example` to `.env` and fill values
- install dependencies:

```bash
npm install
```

- seed sample questions:

```bash
npm run seed
```

- run dev server:
 - run dev server:
```bash
npm run dev
```

CI
- GitHub Actions runs unit tests and Playwright on PRs. See the `ci.yml` workflow.

Run tests
- To avoid Playwright tests being executed by Jest, run unit tests with:

```bash
npm test
```

- To run Playwright UI tests separately use:

```bash
npm run test:playwright
```

Status
- ![CI](https://github.com/agstew/allengregorystewart/actions/workflows/ci.yml/badge.svg)

What is included
- Basic JWT auth (`/api/auth`)
- Questions and answers endpoints with pagination (`/api/questions`)
- Admin endpoints to create questions, grade, rate, and compute averages (`/api/admin`)
- Seeder for sample business-start questions (includes a 300-word example)

Frontend
- A minimal frontend sample is available in the `frontend/` folder. See `frontend/README.md` for run instructions.

Subscription enforcement
- Saving answers requires either an active Stripe subscription or a free tier with remaining allowance. Free tier limits are enforced by counting answers in the last `durationDays`.

Stripe price env vars
- For seeded tiers you can set `STRIPE_PRICE_FREE`, `STRIPE_PRICE_MEMBERS`, and `STRIPE_PRICE_PRO` in your `.env` before running `npm run seed`. This will populate `stripePriceId` on created tiers.

New endpoints
- `GET /api/tiers` — public list of tiers
- `GET /api/admin/tiers` — admin list of tiers
- `GET /api/admin/tier/:id` — admin get single tier
- `PUT /api/admin/tier/:id` — admin update tier (e.g. add `stripePriceId`)
- `GET /api/questions/:id/print` — protected printable view (requires subscription or free allowance)

Webhook testing automation
- You can automatically start an ngrok tunnel and create a Stripe webhook endpoint using the helper script.

1. Add `STRIPE_SECRET` to your `.env` (or skip to only run ngrok without creating the webhook).
2. Run:

```bash
npm run ngrok-webhook
```

The script will start an ngrok tunnel to your backend and, when `STRIPE_SECRET` is present, create a webhook endpoint in your Stripe account pointing at `https://<ngrok>/webhook`. It will print the webhook signing secret — copy that into `STRIPE_WEBHOOK_SECRET` in your `.env` for local testing.

Testing webhooks locally without writing `.env`
- If you prefer not to store secrets in `.env`, you can set the webhook signing secret in the environment for a single process run and verify webhook handling locally. Use the included test helper to send a signed webhook event:

```bash
# export signing secret into env for this shell session only
export STRIPE_WEBHOOK_SECRET=whsec_...
# start the server (no .env changes)
export PORT=5050
node server.js
# in another shell, run the test sender
STRIPE_WEBHOOK_SECRET=whsec_... node scripts/send-test-webhook.js
```

This will post a signed `checkout.session.completed`-like event to `http://localhost:$PORT/webhook` and print the response. The helper does not persist any secrets to disk.

Options
- `NO_CLEANUP=1` or `NO_CLEANUP=true` — when set, the ngrok script will not delete the created Stripe webhook endpoint on exit and will leave the ngrok tunnel running.
- `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASS` — set these before running `npm run seed` to create an admin user automatically. Defaults are `admin@example.com` / `changeme123`.

Printing admin token
- After running `npm run seed` the seeder will print an admin JWT you can paste into `localStorage.token` for the frontend.
- Alternatively, run:

```bash
npm run print-admin-token
```

This will print a JWT for the admin user defined by `SEED_ADMIN_EMAIL`.

Password reset flow
- Use `POST /api/auth/forgot-password` with JSON `{ "email": "user@example.com" }` to request a reset link. The server will email a secure tokenized link.
- Visit the link (frontend `/reset-confirm`) to set a new password via `POST /api/auth/confirm-password-reset` with `{ token, email, password }`.
- Admins can trigger a reset email for any user with `POST /api/admin/reset-password` (admin only).

Stripe & Pricing — Quickstart
- Add your Stripe secret to `.env`: `STRIPE_SECRET=sk_test_...`.
- (Optional) Add `STRIPE_WEBHOOK_SECRET` after creating a webhook (ngrok helper can create it for you).
- Create Stripe Products & Prices and save them to `Tier` documents by running:

```bash
# one-off (recommended for CI/quick run)
STRIPE_SECRET=sk_test_... node scripts/create-stripe-prices.js

# or persist in .env
echo "STRIPE_SECRET=sk_test_..." >> .env
node scripts/create-stripe-prices.js

# force recreate prices if you want to replace existing ones
STRIPE_SECRET=sk_test_... node scripts/create-stripe-prices.js --force
```

The script will create Stripe Products and Prices for the tiers defined in `config/pricing.js` and persist the created `stripePriceId` on the corresponding `Tier` documents.

Local checkout testing
- Start the backend:

```bash
NODE_ENV=development node server.js
```

- List tiers (to get a `tierId`):

```bash
curl -sS http://localhost:4000/api/tiers | jq .
```

- Request a Checkout session for a tier (replace `<TIER_ID>`):

```bash
curl -sS -X POST -H "Content-Type: application/json" -d '{"tierId":"<TIER_ID>"}' http://localhost:4000/api/checkout/create-session | jq .
```

If `STRIPE_SECRET` is set the endpoint will create a real Stripe Checkout session and return `url` pointing to Checkout; otherwise it returns a mock success URL for local/dev testing.

