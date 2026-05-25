# KnoUKno.net

Full-stack web app for business-startup questions, answers, grading, rating, and averages.

## Stack

- Frontend: Next.js, React, Bootstrap 5, CSS3
- Backend: Node.js, Express, JWT, bcryptjs, helmet, cors, dotenv, express-rate-limit, ejs
- Database: MongoDB + Mongoose
- Payments: PayPal order endpoint with mock fallback
- Tooling: Docker, docker-compose, GitHub-ready project structure

## Features included

- Register/Login (JWT)
- Admin dashboard route and admin email support
- PayPal payment flow with order create + capture + webhook status sync
- Collections and links for:
  - payment, title, login, register, print, save, question, grade, rated, answers, average, delete, email
- AI-style question generation (up to 300 unique questions)
- Pagination pages for questions/examples/answers
- Tier pricing logic:
  - Free: 5 questions, 3 days
  - Member: 50 questions/month ($49 -> $39, 20% discount)
  - Pro: 75 questions/year ($675 -> $436, 35% discount)
  - Bonus: 150 (member) or 175 (pro) additional questions for $100
  - Server-side question quota enforcement across question creation endpoints

## Run locally

1. Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Create env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

3. Start app (frontend + backend):

```bash
npm run dev
```

4. Open app:

- Frontend: http://localhost:3000
- API: http://localhost:5001/api

## Run with Docker

```bash
docker compose up --build
```

## Notes

- If PayPal credentials are missing, `/api/payments/create-order` returns `PAYPAL-MOCK-*` order IDs.
- Set `ADMIN_EMAIL` in backend env to control admin account behavior.
- Payment flow endpoints:
  - `POST /api/payments/create-order` with `purchaseType` (`subscription` or `bonus`)
  - `POST /api/payments/capture-order` with `orderId`
  - `POST /api/payments/webhook` for PayPal event callbacks
