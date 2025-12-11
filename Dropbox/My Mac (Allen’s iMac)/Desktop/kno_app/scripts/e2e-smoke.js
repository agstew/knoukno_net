// Simple end-to-end smoke test for backend APIs
// Uses global fetch (Node 18+) and a tiny cookie-jar implementation

const base = process.env.BASE || 'http://localhost:3000';

const jar = new Map();
let cachedCsrf = null;
// We'll store the auth token in the cookie jar to mimic browser behavior

function updateCookies(setCookieHeader) {
  if (!setCookieHeader) return;
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const header of headers) {
    const parts = header.split(';').map((p) => p.trim());
    const [k, v] = parts[0].split('=');
    if (k) {
      // If the server cleared the cookie (empty value), remove it from the jar
      if (v === undefined || v === '') {
        jar.delete(k);
      } else {
        jar.set(k, v);
      }
    }
  }
}

function cookieHeader() {
  return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function doFetch(path, opts = {}) {
  const url = base + path;
  const res = await fetch(url, opts);
  // collect cookies
  const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie');
  if (setCookie) updateCookies(setCookie);
  return res;
}

async function request(path, { method = 'GET', jsonBody = null, csrfToken = null } = {}) {
  const headers = {};
  if (jsonBody != null) headers['Content-Type'] = 'application/json';
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  const cookie = cookieHeader();
  if (cookie) headers['Cookie'] = cookie;

  const res = await doFetch(path, {
    method,
    headers,
    body: jsonBody != null ? JSON.stringify(jsonBody) : undefined,
  });

  const text = await res.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    // keep as text
  }

  return { status: res.status, body };
}

async function getCsrf() {
  if (cachedCsrf) return cachedCsrf;
  const res = await doFetch('/auth/csrf-token', { method: 'GET' });
  if (!res.ok) throw new Error(`Failed to fetch CSRF token: ${res.status}`);
  const data = await res.json();
  cachedCsrf = data.csrfToken;
  return cachedCsrf;
}

async function main() {
  console.log('Base URL:', base);
  let exitCode = 0;
  let questionId = null;
  let answerId = null;

  async function cleanup() {
    try {
      const token = await getCsrf().catch(() => null);
      // If we don't have the auth token cookie, attempt to re-login using
      // the test credentials so cleanup can authenticate. This is robust
      // if tokens are short-lived or were cleared during the main flow.
      const hasToken = jar.has('token') && jar.get('token');
      if (!hasToken && typeof email !== 'undefined' && typeof password !== 'undefined') {
        try {
          const loginRes = await request('/auth/login', { method: 'POST', jsonBody: { email, password }, csrfToken: token });
          if (loginRes && loginRes.body && loginRes.body.token) {
            jar.set('token', loginRes.body.token);
          }
        } catch (e) {
          // ignore login failure; deletion may still fail and we'll report it
        }
      }
      if (answerId) {
        try {
          const r = await request(`/api/answers/${answerId}`, { method: 'DELETE', csrfToken: token });
          console.log('Cleanup: delete answer status:', r.status, 'body:', r.body);
        } catch (e) {
          console.warn('Cleanup: delete answer failed:', e && e.message ? e.message : e);
        }
      }
      if (questionId) {
        try {
          const r = await request(`/api/questions/${questionId}`, { method: 'DELETE', csrfToken: token });
          console.log('Cleanup: delete question status:', r.status, 'body:', r.body);
        } catch (e) {
          console.warn('Cleanup: delete question failed:', e && e.message ? e.message : e);
        }
      }
      try {
        const r = await request('/auth/delete-self', { method: 'POST', csrfToken: token });
        console.log('Cleanup: delete user status:', r.status, 'body:', r.body);
      } catch (e) {
        console.warn('Cleanup: delete user failed (may be not-logged-in):', e && e.message ? e.message : e);
      }
    } catch (e) {
      console.error('Unexpected cleanup error:', e && e.stack ? e.stack : e);
    }
  }

  try {
    const csrf = await getCsrf().catch(() => null);
    console.log('CSRF:', csrf);

    const email = `e2e-${Date.now()}@example.com`;
    const password = 'TestP@ss1';

    // Register
    let csrfToken = await getCsrf();
    let res = await request('/auth/register', { method: 'POST', jsonBody: { email, password }, csrfToken });
    console.log('Register status:', res.status);
    console.log('Register body:', res.body);
    // preserve auth token returned by register by adding it to the cookie jar
    try {
      if (res && res.body && res.body.token) {
        // mirror browser: set a `token` cookie so later requests authenticate
        jar.set('token', res.body.token);
      }
    } catch (e) {
      // ignore
    }

    // Create question
    csrfToken = await getCsrf();
    res = await request('/api/questions', { method: 'POST', jsonBody: { title: 'E2E Q', description: 'Smoke test question' }, csrfToken });
    console.log('Create question status:', res.status);
    console.log('Create question body:', res.body);
    questionId = res.body && (res.body._id || res.body.id) || null;

    // Save answer
    csrfToken = await getCsrf();
    res = await request('/api/answers/save', { method: 'POST', jsonBody: { questionId, response: '42' }, csrfToken });
    console.log('Save answer status:', res.status);
    console.log('Save answer body:', res.body);
    answerId = res.body && (res.body.id || (res.body.answer && res.body.answer._id)) || null;

    // Grade answer
    csrfToken = await getCsrf();
    res = await request('/api/answers/grade', { method: 'POST', jsonBody: { answerId, grade: 'A' }, csrfToken });
    console.log('Grade status:', res.status, 'body:', res.body);

    // Rate answer
    csrfToken = await getCsrf();
    res = await request('/api/answers/rate', { method: 'POST', jsonBody: { answerId, rating: 5 }, csrfToken });
    console.log('Rate status:', res.status, 'body:', res.body);

    // Delete answer
    csrfToken = await getCsrf();
    res = await request(`/api/answers/${answerId}`, { method: 'DELETE', csrfToken });
    console.log('Delete status:', res.status, 'body:', res.body);

    // Delete question
    if (questionId) {
      csrfToken = await getCsrf();
      const delQ = await request(`/api/questions/${questionId}`, { method: 'DELETE', csrfToken });
      console.log('Delete question status:', delQ.status, 'body:', delQ.body);
      questionId = null;
    }

    // NOTE: do not delete the user here — leave account cleanup to the final
    // cleanup() call so the cookie/token remains available for cleanup steps.

    console.log('E2E smoke test completed successfully');
    exitCode = 0;
  } catch (err) {
    console.error('E2E smoke test failed:', err && err.stack ? err.stack : err);
    exitCode = 2;
  } finally {
    try {
      await cleanup();
    } catch (e) {
      console.error('Cleanup encountered an error:', e && e.stack ? e.stack : e);
      if (exitCode === 0) exitCode = 1;
    }
    process.exit(exitCode);
  }
}

main();
