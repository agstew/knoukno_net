# Kno U Kno — Pug Frontend Demo

This repository contains a small Express + Pug frontend demonstrating the `Kno U Kno` layout, pricing tiers, and paginated questions.

Quick start

1. Install dependencies

```bash
cd /Users/allengregorystewart/Dropbox/My\ Mac\ (Allen’s\ iMac)/Desktop/app
npm install
```

2. Run the server

```bash
npm start
# Then open http://localhost:3000
```

Notes

Seeding and environment

Use a `.env` file to set local variables (not committed). Supported variables:
	- `MONGODB_URI` — MongoDB connection string (default: `mongodb://127.0.0.1:27017/kno-u-kno`).
	- `PORT` — port for the app. If unset, app will fall back to an available port.
	- `SEED_TOKEN` — when set, the HTTP seed endpoint requires an `x-admin-token` header matching this value.

Scripts added:
	- `npm run seed` — runs `scripts/force_seed.js` to clear and insert canonical questions.
	- `npm run check-db` — runs `scripts/check_db.js` to list `Question` documents.

Examples:

```bash
# install deps
npm install

# start server (prints chosen port)
npm start

# force seed DB locally
npm run seed

# quick DB check
npm run check-db
```

If you want changes (different questions, more fields, or integration with a backend/API), tell me what you want next and I can adjust the templates or add endpoints.
