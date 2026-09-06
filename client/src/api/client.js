const BASE = import.meta.env.VITE_API_URL || '';

// The refresh token lives only in an httpOnly cookie the server sets — JS never
// sees it. The access token is kept in memory only (never localStorage) so an
// XSS payload can't read a long-lived credential off disk.
let authToken = null;

// Non-sensitive marker so the app knows to attempt a silent refresh on load.
const SESSION_FLAG = 'kk_session';
const hasSession = () => localStorage.getItem(SESSION_FLAG) === '1';

export function setTokens(next = {}) {
  const tokenValue = 'accessToken' in next ? next['accessToken'] : null;
  if (tokenValue !== undefined) {
    authToken = tokenValue;
    authToken ? localStorage.setItem(SESSION_FLAG, '1') : localStorage.removeItem(SESSION_FLAG);
  }
}

export const getRefreshToken = hasSession;
export const clearTokens = () => setTokens({ 'accessToken': null });

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message ?? 'Request failed');
    this.name = 'ApiError';
    this.status = status ?? 0;
    this.details = details ?? null;
    if (details && typeof details === 'object' && 'cause' in details) {
      this.cause = details.cause;
    }
  }
}

async function raw(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = 'Bearer ' + authToken;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      credentials: 'include', // send the httpOnly refresh cookie
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error));
    throw new ApiError(0, cause.message || 'Failed to fetch', { cause });
  }

  if (res.status === 401 && auth && retry && hasSession()) {
    const refreshed = await tryRefresh();
    if (refreshed) return raw(path, { method, body, auth, retry: false });
  }

  let data = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message = data.error || data.message || res.statusText || 'Request failed';
    throw new ApiError(res.status, message, data.details ?? data);
  }

  return data;
}

async function tryRefresh() {
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('refresh failed');
    const data = await res.json();
    setTokens({ 'accessToken': data.accessToken });
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export const api = {
  get: (path, opts) => raw(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => raw(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => raw(path, { ...opts, method: 'PUT', body }),
  del: (path, body, opts) => raw(path, { ...opts, method: 'DELETE', body }),
};
