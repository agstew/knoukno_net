import { config } from '../config/env.js';

export const REFRESH_COOKIE = 'kk_refresh';

/** Minimal Cookie-header parser so we don't need the cookie-parser dependency. */
export function parseCookies(header = '') {
  const jar = {};
  header.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i === -1) return;
    const key = part.slice(0, i).trim();
    if (!key) return;
    jar[key] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return jar;
}

/** The refresh token never touches JS — httpOnly cookie, scoped to the auth routes only. */
export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matches JWT_REFRESH_EXPIRES_IN
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    path: '/api/auth',
  });
}
