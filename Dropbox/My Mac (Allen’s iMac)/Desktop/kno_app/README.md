# KNO App (minimal scaffold)

This repository contains a minimal Node + Express backend with security middleware and an example React client (UMD). It includes the requested dependencies: React, React-DOM, bcryptjs, mongoose, stripe, jsonwebtoken, cors, dotenv, helmet, uuid, express-rate-limit, Jest and Supertest.

Quick start:

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:

```bash
npm install
```

3. Run in development:

```bash
npm run dev
```

4. Run tests:

```bash
npm test
```

Server endpoints:
- GET `/ping` - health check
- POST `/api/auth/register` - register with `{ email, password }`
- POST `/api/auth/login` - login with `{ email, password }`

- GET `/api/me` - protected route; requires `Authorization: Bearer <token>` and returns the current user (no password)

Seed script:
- Run `npm run seed` to populate demo users (see `.env.example` for `MONGO_URI`).

Client:
- Open `http://localhost:3000/` and use the auth form to register or login. The client stores the JWT in `localStorage` and shows a simple profile view.

Client: open `http://localhost:3000/` after server starts.
