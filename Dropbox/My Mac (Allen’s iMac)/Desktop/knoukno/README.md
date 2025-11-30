knoukno
======

Quick notes for local development and CI.

- Start locally: `npm start` (this sets `START_SERVER=1` so the server listens).
- Dev (nodemon): `npm run dev:nodemon` or `npm run dev`.

Environment
- Place local variables in `.env` (example: `DATABASE_URL=file:./dev.db`, `JWT_SECRET=secret`).

Tests
- Tests use Jest with a `jest.global-setup.js` that creates a `test.db`, runs migrations, seeds demo data, and starts a test server.
- Run tests locally with:

```bash
npm test
```

CI
- A GitHub Actions workflow is included at `.github/workflows/ci.yml` — it runs `npm ci`, builds, and runs tests on push/PR.

Server start control
- The server only begins listening when `START_SERVER=1` (this prevents auto-listen in some test environments). `npm start` and `dev:nodemon` set `START_SERVER` automatically.

Logs
- Test run logs are stored under `.jest/` (these files are ignored by git).
