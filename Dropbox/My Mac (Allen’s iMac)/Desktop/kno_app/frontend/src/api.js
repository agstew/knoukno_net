let _csrfToken = null;

// API base: in production this should be empty (same origin).
// For local preview (frontend served on a different port) point to backend.
// NOTE: avoid computing the base only at build time. Some bundlers replace
// `process.env.*` at build time causing `API_BASE` to be an empty string in
// the built bundle. Prefer a small runtime check when needed.
const COMPILED_API_BASE = (process.env.REACT_APP_API_BASE || process.env.VITE_API_BASE || '');

function getApiBaseRuntime() {
  if (COMPILED_API_BASE) return COMPILED_API_BASE;
  try {
    if (typeof window === 'undefined') return '';
    // If frontend is served from any non-backend port (e.g., preview on 5000),
    // point API calls at the local backend on 3000. This handles runtime
    // preview scenarios where the bundle was built with no API_BASE.
    const port = window.location.port;
    if (port && port !== '' && port !== '3000') {
      return 'http://localhost:3000';
    }
    return '';
  } catch (e) {
    return '';
  }
}

const API_BASE = COMPILED_API_BASE;

export function setCsrfToken(token) {
  _csrfToken = token;
}

async function ensureCsrf() {
  if (_csrfToken) return _csrfToken;
  const base = getApiBaseRuntime();
  const res = await fetch(base + '/auth/csrf-token', { credentials: 'include' });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Failed to fetch CSRF token');
  }
  const data = await res.json();
  _csrfToken = data.csrfToken;
  return _csrfToken;
}

function getAuthHeader() {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request(path, { method = 'GET', body = null, requireCsrf = false, json = true } = {}) {
  // Attempt the request up to 2 times when CSRF is required and a 403 occurs.
  for (let attempt = 0; attempt < 2; attempt++) {
    const headers = Object.assign({}, getAuthHeader());
    if (json && body != null) headers['Content-Type'] = 'application/json';

    if (requireCsrf) {
      // ensure we have a token; ensureCsrf will set `_csrfToken`
      const token = await ensureCsrf();
      if (token) headers['X-CSRF-Token'] = token;
    }

    const base = getApiBaseRuntime();
    const res = await fetch(base + path, {
      method,
      headers,
      body: body != null && json ? JSON.stringify(body) : body,
      credentials: 'include',
    });

    const text = await res.text();

    if (res.ok) {
      try {
        return JSON.parse(text || '{}');
      } catch (e) {
        return text;
      }
    }

    // If CSRF-protected route returned 403, clear cached token and retry once
    if (requireCsrf && res.status === 403 && attempt === 0) {
      _csrfToken = null; // clear cached token and retry
      // small delay could be added here if desired
      continue; // retry loop
    }

    // otherwise, throw the error response
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // If we exit loop without returning, throw generic error
  throw new Error('Request failed after retry');
}

export async function fetchQuestions({ page = 1, limit = 10, q = '' } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', limit);
  if (q) params.set('q', q);
  return request(`/api/questions?${params.toString()}`, { method: 'GET' });
}

export async function saveAnswer(payload) {
  return request('/api/answers/save', { method: 'POST', body: payload, requireCsrf: true });
}

export async function deleteAnswer(answerId) {
  return request(`/api/answers/${encodeURIComponent(answerId)}`, { method: 'DELETE', requireCsrf: true });
}

export async function gradeQuestion(questionId, grade) {
  return request(`/api/questions/${encodeURIComponent(questionId)}/grade`, {
    method: 'POST',
    body: { grade },
    requireCsrf: true,
  });
}

export async function updateQuestion(questionId, data) {
  return request(`/api/questions/${encodeURIComponent(questionId)}`, {
    method: 'PUT',
    body: data,
    requireCsrf: true,
  });
}

// Authentication helpers expected by UI components
export async function register({ email, password }) {
  return request('/auth/register', { method: 'POST', body: { email, password }, requireCsrf: true });
}

export async function login({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password }, requireCsrf: true });
}

export async function forgotPassword({ email }) {
  return request('/auth/forgot', { method: 'POST', body: { email }, requireCsrf: true });
}
