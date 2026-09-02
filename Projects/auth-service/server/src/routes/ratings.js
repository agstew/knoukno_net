import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query, queryOne, transaction } from '../db/pool.js';
import { asyncHandler, badRequest } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAuth, requirePaidTier } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requirePaidTier);

/** Rated.js — the answers in ranked order: 1, 2, 3 ... */
router.get(
  '/:titleId',
  asyncHandler(async (req, res) => {
    const titleId = v.uuidLike(req.params.titleId, 'Title id');
    const { page, limit, offset } = v.pagination(req.query, { defaultLimit: 5, maxLimit: 5 });
    const answers = await query(
      `SELECT a.id AS answer_id, a.body, q.position, q.stage, q.prompt,
              COALESCE(r.rank_position, q.position) AS rank_position,
              (r.id IS NOT NULL) AS is_ranked
         FROM answers a
         JOIN questions q ON q.id = a.question_id
         LEFT JOIN ratings r ON r.answer_id = a.id
        WHERE a.title_id = :titleId AND a.user_id = :userId
        ORDER BY rank_position ASC, q.position ASC
        LIMIT ${limit} OFFSET ${offset}`,
      { titleId, userId: req.user.id },
    );
    const total = Number(
      (await queryOne(
        'SELECT COUNT(*) AS count FROM answers WHERE title_id = :titleId AND user_id = :userId',
        { titleId, userId: req.user.id },
      )).count,
    );
    res.json({
      answers,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  }),
);

/** Reorder: the client drags an answer to a new spot and sends the whole ordered list. */
router.put(
  '/:titleId',
  asyncHandler(async (req, res) => {
    const titleId = v.uuidLike(req.params.titleId, 'Title id');
    const order = req.body.order;
    const startRank = Math.max(1, Number.parseInt(req.body.startRank, 10) || 1);
    if (!Array.isArray(order) || !order.length) throw badRequest('order must be a non-empty array of answer ids');
    order.forEach((id, i) => v.uuidLike(id, `order[${i}]`));

    const owned = await query(
      'SELECT id FROM answers WHERE title_id = :titleId AND user_id = :userId',
      { titleId, userId: req.user.id },
    );
    const ownedIds = new Set(owned.map((a) => a.id));
    if (order.some((id) => !ownedIds.has(id))) throw badRequest('Order contains an answer that is not yours');

    await transaction(async (conn) => {
      for (let i = 0; i < order.length; i += 1) {
        await conn.execute(
          `INSERT INTO ratings (id, answer_id, title_id, user_id, rank_position)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE rank_position = VALUES(rank_position)`,
          [uuid(), order[i], titleId, req.user.id, startRank + i],
        );
      }
    });

    res.json({ ok: true, ranked: order.length });
  }),
);

export default router;
