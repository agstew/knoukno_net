import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { v4 as uuid } from 'uuid';
import { config } from '../config/env.js';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler, badRequest, conflict, unauthorized } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { authLimiter, forgotLimiter } from '../middleware/rateLimit.js';
import {
  requireAuth,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth.js';
import { clearRefreshCookie, REFRESH_COOKIE, setRefreshCookie } from '../lib/cookies.js';
import { entitlementsFor } from '../services/entitlements.js';
import { quotaFor, TIERS } from '../config/tiers.js';
import { sendMail } from '../services/mailer.js';

const router = Router();

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  firstName: u.first_name,
  lastName: u.last_name,
  role: u.role,
  tier: u.tier,
  bonus: Boolean(u.bonus),
  questionQuota: u.question_quota,
  tierExpiresAt: u.tier_expires_at,
});

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function issueSession(user, req) {
  const sessionId = uuid();
  const refreshToken = signRefreshToken(user, sessionId);
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  await query(
    `INSERT INTO login_sessions (id, user_id, refresh_hash, ip, user_agent, expires_at)
     VALUES (:id, :userId, :hash, :ip, :ua, :expires)`,
    {
      id: sessionId,
      userId: user.id,
      hash: sha256(refreshToken),
      ip: (req.ip || '').slice(0, 64),
      ua: (req.get('user-agent') || '').slice(0, 255),
      expires,
    },
  );

  return { accessToken: signAccessToken(user), refreshToken };
}

// Everyone has to register.
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = v.email(req.body.email);
    const password = v.password(req.body.password);
    const firstName = v.str(req.body.firstName, 'First name', { max: 80, required: false });
    const lastName = v.str(req.body.lastName, 'Last name', { max: 80, required: false });

    const existing = await queryOne('SELECT id FROM users WHERE email = :email LIMIT 1', { email });
    if (existing) throw conflict('An account with that email already exists');

    const id = uuid();
    const hash = await bcrypt.hash(password, config.bcryptRounds);
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + TIERS.free.durationDays);

    await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, tier, question_quota,
                          tier_started_at, tier_expires_at)
       VALUES (:id, :email, :hash, :firstName, :lastName, 'free', :quota, NOW(), :trialEnds)`,
      { id, email, hash, firstName, lastName, quota: quotaFor('free'), trialEnds },
    );

    const user = await queryOne('SELECT * FROM users WHERE id = :id', { id });
    const tokens = await issueSession(user, req);
    setRefreshCookie(res, tokens.refreshToken);

    // Email #1: new to the website.
    sendMail({
      to: email,
      template: 'welcome',
      userId: id,
      ctaUrl: `${config.appUrl}/title`,
      context: { firstName, trialDays: TIERS.free.durationDays, freeQuestions: TIERS.free.questions },
    }).catch((err) => console.warn('welcome email failed:', err.message));

    res.status(201).json({ user: publicUser(user), accessToken: tokens.accessToken });
  }),
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = v.email(req.body.email);
    const password = v.str(req.body.password, 'Password', { max: 200 });

    const user = await queryOne('SELECT * FROM users WHERE email = :email LIMIT 1', { email });
    // Constant-ish work either way so a missing account is not distinguishable by timing.
    const hash = user?.password_hash || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) throw unauthorized('Email or password is incorrect');

    await query('UPDATE users SET last_login_at = NOW() WHERE id = :id', { id: user.id });
    const tokens = await issueSession(user, req);
    setRefreshCookie(res, tokens.refreshToken);

    res.json({ user: publicUser(user), accessToken: tokens.accessToken });
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) throw unauthorized('No session cookie found, please log in again');

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw unauthorized('Session expired, please log in again');
    }

    const session = await queryOne(
      `SELECT * FROM login_sessions
        WHERE id = :sid AND user_id = :uid AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1`,
      { sid: payload.sid, uid: payload.sub },
    );
    if (!session || session.refresh_hash !== sha256(token)) throw unauthorized('Session is no longer valid');

    const user = await queryOne('SELECT * FROM users WHERE id = :id', { id: payload.sub });
    if (!user) throw unauthorized('Account no longer exists');

    res.json({ user: publicUser(user), accessToken: signAccessToken(user) });
  }),
);

router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    await query(
      `UPDATE login_sessions SET revoked_at = NOW() WHERE user_id = :userId AND revoked_at IS NULL`,
      { userId: req.user.id },
    );
    clearRefreshCookie(res);
    res.json({ ok: true });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const entitlements = await entitlementsFor(req.user);
    res.json({ user: publicUser(req.user), entitlements });
  }),
);

// Email #3: forgot my password (fully automated, nobody has to send it).
router.post(
  '/forgot-password',
  forgotLimiter,
  asyncHandler(async (req, res) => {
    const email = v.email(req.body.email);
    const user = await queryOne('SELECT * FROM users WHERE email = :email LIMIT 1', { email });

    if (user) {
      const raw = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + config.passwordResetTtlMinutes * 60_000);

      await query(
        `INSERT INTO password_resets (id, user_id, token_hash, expires_at)
         VALUES (:id, :userId, :hash, :expires)`,
        { id: uuid(), userId: user.id, hash: sha256(raw), expires },
      );

      const result = await sendMail({
        to: email,
        template: 'password_reset',
        userId: user.id,
        ctaUrl: `${config.appUrl}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`,
        context: { firstName: user.first_name, expiresInMinutes: config.passwordResetTtlMinutes },
      });

      if (!result.sent) {
        console.error(`[auth] password reset email failed for ${email}:`, result.error || 'SMTP not configured');
        return res.status(503).json({
         error: 'We could not send the reset link right now. Please try again in a few minutes.',
        });
      }
    }

    // Always the same response so the endpoint cannot be used to enumerate accounts.
    res.json({ ok: true, message: 'If that email is registered, a reset link is on its way.' });
  }),
);

router.post(
  '/reset-password',
  forgotLimiter,
  asyncHandler(async (req, res) => {
    const token = v.str(req.body.token, 'Token', { max: 128 });
    const password = v.password(req.body.password);

    const record = await queryOne(
      `SELECT * FROM password_resets
        WHERE token_hash = :hash AND used_at IS NULL AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1`,
      { hash: sha256(token) },
    );
    if (!record) throw badRequest('That reset link is invalid or has expired');

    const hash = await bcrypt.hash(password, config.bcryptRounds);
    await query('UPDATE users SET password_hash = :hash WHERE id = :id', {
      hash,
      id: record.user_id,
    });
    await query('UPDATE password_resets SET used_at = NOW() WHERE id = :id', { id: record.id });
    await query(
      `UPDATE login_sessions SET revoked_at = NOW() WHERE user_id = :id AND revoked_at IS NULL`,
      { id: record.user_id },
    );

    res.json({ ok: true, message: 'Password updated. You can log in now.' });
  }),
);

export default router;
