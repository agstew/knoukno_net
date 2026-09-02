import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler, badRequest, notFound } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { generateQuestion } from '../services/openai.js';
import { assertCanGenerate, entitlementsFor } from '../services/entitlements.js';

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

/** Question.js — paginated 1..5 for free, up to the tier quota otherwise. */
router.get(
  '/:titleId',
  asyncHandler(async (req, res) => {
    const title = await ownedTitle(v.uuidLike(req.params.titleId, 'Title id'), req.user.id);
    const ent = await entitlementsFor(req.user, title.id);
    const { page, limit, offset } = v.pagination(req.query, {
      defaultLimit: 5,
      maxLimit: Math.max(5, ent.quota),
    });

    const rows = await query(
      `SELECT q.id, q.stage, q.position, q.prompt, q.example, q.word_count, q.created_at,
              a.id AS answer_id, a.body AS answer_body, a.word_count AS answer_word_count,
              a.updated_at AS answer_updated_at
         FROM questions q
         LEFT JOIN answers a ON a.question_id = q.id
        WHERE q.title_id = :titleId
        ORDER BY q.position ASC
        LIMIT ${limit} OFFSET ${offset}`,
      { titleId: title.id },
    );

    const total = Number(
      (await queryOne('SELECT COUNT(*) AS c FROM questions WHERE title_id = :titleId', {
        titleId: title.id,
      }))?.c || 0,
    );

    res.json({
      title,
      entitlements: ent,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
      questions: rows.map((r) => ({
        id: r.id,
        stage: r.stage,
        position: r.position,
        prompt: r.prompt,
        example: r.example,
        wordCount: r.word_count,
        answer: r.answer_id
          ? { id: r.answer_id, body: r.answer_body, wordCount: r.answer_word_count, updatedAt: r.answer_updated_at }
          : null,
      })),
    });
  }),
);

/** AI writes the next question(s) for this business, following law -> location -> hiring -> people. */
router.post(
  '/:titleId/generate',
  aiLimiter,
  asyncHandler(async (req, res) => {
    const title = await ownedTitle(v.uuidLike(req.params.titleId, 'Title id'), req.user.id);
    const count = Math.min(5, Math.max(1, Number.parseInt(req.body.count, 10) || 1));

    const ent = await assertCanGenerate(req.user, count, title.id);

    const existing = await query(
      'SELECT position, prompt FROM questions WHERE title_id = :titleId ORDER BY position ASC',
      { titleId: title.id },
    );
    let nextPosition = existing.length ? existing[existing.length - 1].position + 1 : 1;
    const previousPrompts = existing.slice(-8).map((q) => q.prompt);
    const created = [];

    for (let i = 0; i < count; i += 1) {
      if (nextPosition > ent.quota) break;

      const generated = await generateQuestion({
        business: title,
        position: nextPosition,
        total: ent.quota,
        previousPrompts: [...previousPrompts, ...created.map((c) => c.prompt)],
      });

      const id = uuid();
      await query(
        `INSERT INTO questions (id, title_id, user_id, stage, position, prompt, example, word_count, model)
         VALUES (:id, :titleId, :userId, :stage, :position, :prompt, :example, :wordCount, :model)`,
        {
          id,
          titleId: title.id,
          userId: req.user.id,
          stage: generated.stage,
          position: nextPosition,
          prompt: generated.prompt,
          example: generated.example,
          wordCount: v.countWords(generated.prompt),
          model: generated.model,
        },
      );

      created.push({ id, position: nextPosition, ...generated });
      nextPosition += 1;
    }

    if (!created.length) throw badRequest('You have reached the question limit for your plan');

    res.status(201).json({
      questions: created,
      entitlements: await entitlementsFor(req.user, title.id),
    });
  }),
);

/** Example.js — the AI-written worked example for a single question. */
router.get(
  '/example/:questionId',
  asyncHandler(async (req, res) => {
    const question = await queryOne(
      'SELECT * FROM questions WHERE id = :id AND user_id = :userId LIMIT 1',
      { id: v.uuidLike(req.params.questionId, 'Question id'), userId: req.user.id },
    );
    if (!question) throw notFound('Question not found');

    res.json({
      question: {
        id: question.id,
        position: question.position,
        stage: question.stage,
        prompt: question.prompt,
        example: question.example,
      },
    });
  }),
);

export default router;
