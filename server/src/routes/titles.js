import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler, notFound } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { entitlementsFor } from '../services/entitlements.js';

const router = Router();
router.use(requireAuth);

async function ownedTitle(titleId, userId) {
  const title = await queryOne(
    'SELECT * FROM titles WHERE id = :id AND user_id = :userId LIMIT 1',
    { id: titleId, userId },
  );
  if (!title) throw notFound('Business title not found');
  return title;
}

// Title.js form -> creates the business title
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const id = uuid();
    const businessTitle = v.str(req.body.businessTitle, 'Business title', { min: 2, max: 190 });
    const industry = v.str(req.body.industry, 'Industry', { max: 120, required: false });
    const location = v.str(req.body.location, 'Location', { max: 190, required: false });
    const description = v.str(req.body.description, 'Description', { max: 4000, required: false });

    await query(
      `INSERT INTO titles (id, user_id, business_title, industry, location, description)
       VALUES (:id, :userId, :businessTitle, :industry, :location, :description)`,
      { id, userId: req.user.id, businessTitle, industry, location, description },
    );

    res.status(201).json({ title: await queryOne('SELECT * FROM titles WHERE id = :id', { id }) });
  }),
);

// titleName.js -> the list of business titles
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const titles = await query(
      `SELECT t.*,
              (SELECT COUNT(*) FROM questions q WHERE q.title_id = t.id) AS question_count,
              (SELECT COUNT(*) FROM answers a  WHERE a.title_id = t.id) AS answer_count
         FROM titles t
        WHERE t.user_id = :userId AND t.status = 'active'
        ORDER BY t.created_at DESC`,
      { userId: req.user.id },
    );
    res.json({ titles });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const title = await ownedTitle(v.uuidLike(req.params.id, 'Title id'), req.user.id);
    const stats = await queryOne(
      `SELECT
         (SELECT COUNT(*) FROM questions WHERE title_id = :id) AS question_count,
         (SELECT COUNT(*) FROM answers   WHERE title_id = :id) AS answer_count,
         (SELECT COUNT(*) FROM grades    WHERE title_id = :id) AS graded_count,
         (SELECT COUNT(*) FROM ratings   WHERE title_id = :id) AS rated_count`,
      { id: title.id },
    );
    res.json({ title, stats, entitlements: await entitlementsFor(req.user, title.id) });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const title = await ownedTitle(v.uuidLike(req.params.id, 'Title id'), req.user.id);
    const businessTitle = v.str(req.body.businessTitle, 'Business title', { min: 2, max: 190 });
    const industry = v.str(req.body.industry, 'Industry', { max: 120, required: false });
    const location = v.str(req.body.location, 'Location', { max: 190, required: false });
    const description = v.str(req.body.description, 'Description', { max: 4000, required: false });

    await query(
      `UPDATE titles SET business_title = :businessTitle, industry = :industry,
              location = :location, description = :description
        WHERE id = :id`,
      { businessTitle, industry, location, description, id: title.id },
    );

    res.json({ title: await queryOne('SELECT * FROM titles WHERE id = :id', { id: title.id }) });
  }),
);

// Collection for delete — the row is archived and the removal is recorded.
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const title = await ownedTitle(v.uuidLike(req.params.id, 'Title id'), req.user.id);

    await query("UPDATE titles SET status = 'archived' WHERE id = :id", { id: title.id });
    await query(
      `INSERT INTO deletions (id, user_id, entity_type, entity_id, payload, reason)
       VALUES (:id, :userId, 'title', :entityId, CAST(:payload AS JSON), :reason)`,
      {
        id: uuid(),
        userId: req.user.id,
        entityId: title.id,
        payload: JSON.stringify(title),
        reason: v.str(req.body?.reason, 'Reason', { max: 255, required: false }),
      },
    );

    res.json({ ok: true });
  }),
);

export default router;
