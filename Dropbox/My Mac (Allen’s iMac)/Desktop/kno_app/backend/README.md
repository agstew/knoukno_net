# Kno U Kno — Backend

[![Coverage Status](https://codecov.io/gh/agstew/allengregorystewart/branch/feature/submissions-and-tests/graph/badge.svg?token=CODECOV_TOKEN_HERE)](https://codecov.io/gh/agstew/allengregorystewart)

Quick start for the backend (Express + Pug + MongoDB)

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment

Copy `.env.example` to `.env` and edit `MONGO_URI` or other values.

3. Seed the database (creates 525 questions — 175 per category)

```bash
npm run seed
```

4. Run the server

```bash
npm run start
# or for development
npm run dev
```

Routes:
- `/` home
- `/questions` questions (requires login)
- `/pricing` pricing (requires login)
- `/auth/register`, `/auth/login`, `/auth/forgot`, `/auth/logout`

Stripe setup

- Add the following environment variables to `.env`:
  - `STRIPE_SECRET_KEY` (your Stripe secret key)
  - `STRIPE_PUBLIC_KEY` (your Stripe publishable key)
  - `STRIPE_WEBHOOK_SECRET` (your webhook signing secret; optional for testing)

- The app exposes `/payments/create-checkout-session` which creates a Stripe Checkout session. The webhook endpoint `/webhook` updates the user's membership after successful payment.

Local webhook testing options

- Preferred: use the Stripe CLI to forward events to your local server (recommended because it provides signed events):

```bash
# in one terminal (start the app)
cd backend
npm run dev

# in another terminal (stripe CLI forward)
stripe listen --forward-to localhost:3000/webhook
```

When using the Stripe CLI the webhook signing secret will be shown after running `stripe listen` — copy it into your `.env` as `STRIPE_WEBHOOK_SECRET` so the server can verify signatures.

- Alternative (quick smoke test): the repo includes `backend/scripts/send_test_webhook.js` which posts a sample event to your local `/webhook` endpoint. This does not generate a valid Stripe signature header; only use it when your `/webhook` handler does not strictly verify signatures.

```bash
# run a simple test POST to your local webhook
node backend/scripts/send_test_webhook.js
```

Signed webhook helper

If your `/webhook` endpoint validates Stripe signatures, use the signed helper to generate a valid `Stripe-Signature` header.

```bash
# print signature + payload (no network)
node backend/scripts/send_signed_webhook.js --print --secret=whsec_test

# send signed POST to local server
node backend/scripts/send_signed_webhook.js --secret=whsec_test --url=http://localhost:3000/webhook --send
```

Note: the helper requires the `minimist` package (already in devDeps). You can also set `STRIPE_WEBHOOK_SECRET` in your environment instead of passing `--secret`.

Pricing (current):

- Free tier: 5 questions for 3 days — Price $0. Includes Save and Print pages. (All users must register.)
- Members tier: 175 questions — Price $49.00 (discount applied to $39.00). Includes Print, Save, Grade, Rate, Average pages.
 - Pro tier: 75 questions / Year — Price $675.00 (discount applied to $436.00). Includes Print, Save, Grade, Rate, Average pages.
 - Bonus: 100 extra questions for $100.00 if purchased.

The server charges the discounted amounts shown on the pricing page.

