import { Router } from 'express';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler, badRequest } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { purgeExpiredEmails, sendMail } from '../services/mailer.js';
import { applyTier } from '../services/entitlements.js';
import { TIER_KEYS, toDollars } from '../config/tiers.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const stats = await queryOne(
      `SELECT
         (SELECT COUNT(*) FROM users)     AS users,
         (SELECT COUNT(*) FROM users WHERE tier <> 'free') AS paid_users,
         (SELECT COUNT(*) FROM titles)    AS titles,
         (SELECT COUNT(*) FROM questions) AS questions,
         (SELECT COUNT(*) FROM answers)   AS answers,
         (SELECT COUNT(*) FROM grades)    AS grades,
         (SELECT COUNT(*) FROM ratings)   AS ratings,
         (SELECT COUNT(*) FROM prints)    AS prints,
         (SELECT COUNT(*) FROM email_log) AS emails,
         (SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE status='paid') AS revenue_cents`,
    );
    res.json({ ...stats, revenue: toDollars(Number(stats.revenue_cents)) });
  }),
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { limit, offset, page } = v.pagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const search = v.str(req.query.q, 'Search', { max: 190, required: false });

    const rows = await query(
      `SELECT id, email, first_name, last_name, role, tier, bonus, question_quota,
              tier_expires_at, last_login_at, created_at
         FROM users
        WHERE (:search IS NULL OR email LIKE CONCAT('%', :search, '%'))
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}`,
      { search: search || null },
    );
    const total = Number(
      (
        await queryOne(
          `SELECT COUNT(*) AS c FROM users WHERE (:search IS NULL OR email LIKE CONCAT('%', :search, '%'))`,
          { search: search || null },
        )
      )?.c || 0,
    );

    res.json({ users: rows, pagination: { page, limit, total } });
  }),
);

router.put(
  '/users/:id/tier',
  asyncHandler(async (req, res) => {
    const id = v.uuidLike(req.params.id, 'User id');
    const tier = v.oneOf(req.body.tier, 'Tier', TIER_KEYS);
    const bonus = v.bool(req.body.bonus);

    const user = await queryOne('SELECT id FROM users WHERE id = :id', { id });
    if (!user) throw badRequest('User not found');

    await applyTier(id, tier, bonus);
    res.json({ ok: true });
  }),
);

router.get(
  '/payments',
  asyncHandler(async (req, res) => {
    const { limit, offset } = v.pagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const payments = await query(
      `SELECT p.*, u.email FROM payments p JOIN users u ON u.id = p.user_id
        ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    );
    res.json({ payments: payments.map((p) => ({ ...p, amount: toDollars(p.amount_cents) })) });
  }),
);

router.get(
  '/emails',
  asyncHandler(async (req, res) => {
    const { limit, offset } = v.pagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const emails = await query(
      `SELECT id, user_id, to_email, template, subject, status, error, created_at, purge_after
         FROM email_log ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    );
    res.json({ emails });
  }),
);

/** Email #2: one to a single address, or a broadcast to every registered user. */
router.post(
  '/emails/send',
  asyncHandler(async (req, res) => {
    const target = v.oneOf(req.body.target || 'single', 'Target', ['single', 'all']);
    const subject = v.str(req.body.subject, 'Subject', { max: 255, required: false });
    const body = v.str(req.body.body, 'Body', { max: 20000, required: false });

    if (target === 'single') {
      const to = v.email(req.body.email);
      const user = await queryOne('SELECT id FROM users WHERE email = :to', { to });
      const result = await sendMail({
        to,
        template: 'broadcast',
        userId: user?.id || null,
        context: { subject, body, audience: 'one member' },
      });
      return res.json({ ok: true, sent: result.sent ? 1 : 0, failed: result.sent ? 0 : 1 });
    }

    const recipients = await query('SELECT id, email FROM users');
    let sent = 0;
    let failed = 0;
    for (const r of recipients) {
      // Copy is generated once and reused so a broadcast is not one AI call per member.
      const result = await sendMail({
        to: r.email,
        template: 'broadcast',
        userId: r.id,
        context: { subject, body, audience: 'all members' },
        aiCopy: !subject || !body,
      });
      result.sent ? (sent += 1) : (failed += 1);
    }

    res.json({ ok: true, sent, failed, recipients: recipients.length });
  }),
);

/** Enforces the 2-year email retention rule. */
router.post(
  '/emails/purge',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, purged: await purgeExpiredEmails() });
  }),
);

router.get(
  '/deletions',
  asyncHandler(async (req, res) => {
    const { limit, offset } = v.pagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const deletions = await query(
      `SELECT id, user_id, entity_type, entity_id, reason, deleted_at
         FROM deletions ORDER BY deleted_at DESC LIMIT ${limit} OFFSET ${offset}`,
    );
    res.json({ deletions });
  }),
);

export default router;
