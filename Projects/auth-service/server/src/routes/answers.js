import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler, notFound } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/** AnswersList.js — every answer for a business title, with grade and rank attached. */
router.get(
  '/:titleId',
  asyncHandler(async (req, res) => {
    const titleId = v.uuidLike(req.params.titleId, 'Title id');
    const answers = await query(
      `SELECT a.id, a.body, a.word_count, a.updated_at,
              q.position, q.stage, q.prompt,
              g.letter, g.points,
              r.rank_position
         FROM answers a
         JOIN questions q ON q.id = a.question_id
         LEFT JOIN grades  g ON g.answer_id = a.id
         LEFT JOIN ratings r ON r.answer_id = a.id
        WHERE a.title_id = :titleId AND a.user_id = :userId
        ORDER BY COALESCE(r.rank_position, q.position) ASC`,
      { titleId, userId: req.user.id },
    );
    res.json({ answers });
  }),
);

/** The answer comes from the client, saved so it can be used later. */
router.put(
  '/:questionId',
  asyncHandler(async (req, res) => {
    const questionId = v.uuidLike(req.params.questionId, 'Question id');
    const body = v.str(req.body.body, 'Answer', { min: 1, max: 20000 });

    const question = await queryOne(
      'SELECT * FROM questions WHERE id = :id AND user_id = :userId LIMIT 1',
      { id: questionId, userId: req.user.id },
    );
    if (!question) throw notFound('Question not found');

    const existing = await queryOne('SELECT id FROM answers WHERE question_id = :id', {
      id: questionId,
    });
    const wordCount = v.countWords(body);

    if (existing) {
      await query('UPDATE answers SET body = :body, word_count = :wordCount WHERE id = :id', {
        body,
        wordCount,
        id: existing.id,
      });
    } else {
      await query(
        `INSERT INTO answers (id, question_id, title_id, user_id, body, word_count)
         VALUES (:id, :questionId, :titleId, :userId, :body, :wordCount)`,
        {
          id: uuid(),
          questionId,
          titleId: question.title_id,
          userId: req.user.id,
          body,
          wordCount,
        },
      );
    }

    const answer = await queryOne('SELECT * FROM answers WHERE question_id = :id', {
      id: questionId,
    });
    res.json({ answer });
  }),
);

router.delete(
  '/:answerId',
  asyncHandler(async (req, res) => {
    const answerId = v.uuidLike(req.params.answerId, 'Answer id');
    const answer = await queryOne(
      'SELECT * FROM answers WHERE id = :id AND user_id = :userId LIMIT 1',
      { id: answerId, userId: req.user.id },
    );
    if (!answer) throw notFound('Answer not found');

    await query(
      `INSERT INTO deletions (id, user_id, entity_type, entity_id, payload)
       VALUES (:id, :userId, 'answer', :entityId, CAST(:payload AS JSON))`,
      { id: uuid(), userId: req.user.id, entityId: answer.id, payload: JSON.stringify(answer) },
    );
    await query('DELETE FROM answers WHERE id = :id', { id: answer.id });

    res.json({ ok: true });
  }),
);

export default router;
