import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { queryOne } from '../db/pool.js';
import { forbidden, unauthorized } from '../lib/errors.js';

export function signAccessToken(user) {
  // Authorization always re-reads tier/quota from the DB in requireAuth — never from this token.
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn, issuer: config.domain },
  );
}

export function signRefreshToken(user, sessionId) {
  return jwt.sign({ sub: user.id, sid: sessionId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: config.domain,
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret, { issuer: config.domain });
}

function bearerFrom(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = bearerFrom(req);
    if (!token) throw unauthorized();

    let payload;
    try {
      payload = jwt.verify(token, config.jwt.secret, { issuer: config.domain });
    } catch {
      throw unauthorized('Session expired, please log in again');
    }

    const user = await queryOne(
      `SELECT id, email, first_name, last_name, role, tier, bonus, question_quota,
              tier_started_at, tier_expires_at
       FROM users WHERE id = :id LIMIT 1`,
      { id: payload.sub },
    );
    if (!user) throw unauthorized('Account no longer exists');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') return next(forbidden('Admin access required'));
  next();
}

/** Blocks Grade / Rate / Average pages for the free tier. */
export function requirePaidTier(req, _res, next) {
  if (!req.user) return next(unauthorized());
  if (req.user.tier === 'free') {
    return next(forbidden('Upgrade to Member or Pro to use Grade, Rate, and Average'));
  }
  next();
}
