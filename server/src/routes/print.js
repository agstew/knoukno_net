import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler, notFound } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/** Everything the print / save page needs in one payload. */
router.get(
  '/:titleId',
  asyncHandler(async (req, res) => {
    const titleId = v.uuidLike(req.params.titleId, 'Title id');
    const kind = ['print', 'save'].includes(req.query.kind) ? req.query.kind : 'print';

    const title = await queryOne(
      'SELECT * FROM titles WHERE id = :id AND user_id = :userId LIMIT 1',
      { id: titleId, userId: req.user.id },
    );
    if (!title) throw notFound('Business title not found');

    const items = await query(
      `SELECT q.position, q.stage, q.prompt, q.example,
              a.body AS answer, a.word_count,
              g.letter, g.points,
              r.rank_position
         FROM questions q
         LEFT JOIN answers a ON a.question_id = q.id
         LEFT JOIN grades  g ON g.answer_id = a.id
         LEFT JOIN ratings r ON r.answer_id = a.id
        WHERE q.title_id = :titleId
        ORDER BY q.position ASC`,
      { titleId },
    );

    await query(
      `INSERT INTO prints (id, user_id, title_id, kind, page) VALUES (:id, :userId, :titleId, :kind, 'questions')`,
      { id: uuid(), userId: req.user.id, titleId, kind },
    );

    res.json({
      title,
      generatedAt: new Date().toISOString(),
      owner: { email: req.user.email, name: [req.user.first_name, req.user.last_name].filter(Boolean).join(' ') },
      items,
    });
  }),
);

router.get(
  '/history/all',
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT p.id, p.kind, p.page, p.created_at, t.business_title
         FROM prints p JOIN titles t ON t.id = p.title_id
        WHERE p.user_id = :userId
        ORDER BY p.created_at DESC LIMIT 100`,
      { userId: req.user.id },
    );
    res.json({ prints: rows });
  }),
);

export default router;
