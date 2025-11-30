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

Cloud Run deploy
----------------

This project includes a `Dockerfile` and a GitHub Actions workflow to build and deploy the app to Google Cloud Run.

How it works
- The container image is built in CI and pushed to Google Container Registry (GCR).
- The workflow deploys the image to Cloud Run.

How to set up deploy keys and secrets
1. Create a Google Cloud service account with the role `Cloud Run Admin` and `Storage Admin` (or `Editor` for broader access).
2. Create a JSON key for the service account and add it as a repository secret named `GCP_SA_KEY`.
3. Edit `.github/workflows/cloud-run-deploy.yml` and set `GCP_PROJECT` and `CLOUD_RUN_SERVICE` env values at the top of the file (or set them as repository secrets and reference them in the workflow).

Manual deploy (local)
1. Build the image locally:

```bash
docker build -t gcr.io/YOUR_GCP_PROJECT_ID/knoukno-service:latest .
```

2. Push the image (login with gcloud):

```bash
gcloud auth configure-docker
docker push gcr.io/YOUR_GCP_PROJECT_ID/knoukno-service:latest
```

3. Deploy to Cloud Run:

```bash
gcloud run deploy knoukno-service --image gcr.io/YOUR_GCP_PROJECT_ID/knoukno-service:latest --region us-central1 --platform managed
```

Replace `YOUR_GCP_PROJECT_ID` and `knoukno-service` with your values.

Firebase (Hosting + Firestore + Auth)
------------------------------------

If you want to host the frontend on Firebase and use Firestore + Firebase Authentication as the backend services, follow these steps:

1. Create a Firebase project in the Firebase Console.
2. Enable Firestore (Native mode) and Authentication (Email/password or providers you need).
3. Create a service account JSON key for CI:

    - Google Cloud Console → IAM & Admin → Service Accounts → Create Service Account
    - Grant roles: `Firebase Admin` or `Editor` (or more restrictive: `Firebase Hosting Admin` + `Firebase Rules Admin` + `Cloud Datastore User`)
    - Create a JSON key and save it.

4. Add repository secrets in GitHub:

    - `FIREBASE_SERVICE_ACCOUNT`: the full JSON key contents
    - `FIREBASE_PROJECT_ID`: your Firebase project id

- Local dev and server integration

- Add `FIREBASE_SERVICE_ACCOUNT` (JSON) or `FIREBASE_SERVICE_ACCOUNT_FILE` (path to key file) to your environment when running the server locally if you need server-side admin access.
- The repo includes `src/lib/firebaseAdmin.mjs` which initializes `firebase-admin` using these env vars and exports `firestore` and `firebaseAuth` for server code.
- Use `src/middleware/firebaseAuth.mjs` to verify ID tokens issued by Firebase Auth and attach `req.user`.
- Note: When running the server locally with Firebase admin credentials (server-side access), set `START_SERVER=1` so the server actually listens for requests. Example:

```bash
START_SERVER=1 npm start
```

Client flow

- Use Firebase client SDK on the frontend to sign up / sign in users and obtain ID tokens.
- Send ID tokens in `Authorization: Bearer <idToken>` header when calling protected server APIs.

Frontend snippet (quick start)

1. Include Firebase client (compat) in your HTML (replace <PROJECT_CONFIG> with your config):

```html
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
<script>
const firebaseConfig = { /* your firebase config object */ };
firebase.initializeApp(firebaseConfig);
</script>
<script src="/js/firebase-auth.js"></script>
```

1. Use the helper from your page code:

```html
<script>
async function loginDemo() {
  const { idToken } = await firebaseAuthHelper.signIn('demo@localhost', 'password123');
  // use idToken as Authorization header for server requests
  const res = await fetch('/api/some-protected', {
    headers: { Authorization: `Bearer ${idToken}` }
  });
  console.log(await res.json());
}
// call loginDemo() from a button click
</script>
```


