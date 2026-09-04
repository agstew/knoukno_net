import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler, notFound } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAuth, requirePaidTier } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requirePaidTier);

export const LETTER_POINTS = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const LETTERS = Object.keys(LETTER_POINTS);

export function letterForAverage(avg) {
  if (avg >= 3.5) return 'A';
  if (avg >= 2.5) return 'B';
  if (avg >= 1.5) return 'C';
  if (avg >= 0.5) return 'D';
  return 'F';
}

/** Grade.js — every answer with its grade, plus the sum of all grades. */
router.get(
  '/:titleId',
  asyncHandler(async (req, res) => {
    const titleId = v.uuidLike(req.params.titleId, 'Title id');
    const { page, limit, offset } = v.pagination(req.query, { defaultLimit: 5, maxLimit: 5 });

    const answers = await query(
      `SELECT a.id AS answer_id, a.body, a.word_count,
              q.position, q.stage, q.prompt,
              g.id AS grade_id, g.letter, g.points, g.note
         FROM answers a
         JOIN questions q ON q.id = a.question_id
         LEFT JOIN grades g ON g.answer_id = a.id
        WHERE a.title_id = :titleId AND a.user_id = :userId
        ORDER BY q.position ASC
        LIMIT ${limit} OFFSET ${offset}`,
      { titleId, userId: req.user.id },
    );

    const totals = await queryOne(
      `SELECT
              (SELECT COUNT(*) FROM questions
                WHERE title_id = :titleId AND user_id = :userId) AS written_count,
              COUNT(a.id) AS answer_count,
              COUNT(g.id) AS graded_count,
              COALESCE(SUM(g.points), 0) AS total_points
         FROM answers a
         LEFT JOIN grades g ON g.answer_id = a.id
        WHERE a.title_id = :titleId AND a.user_id = :userId`,
      { titleId, userId: req.user.id },
    );
    const writtenCount = Number(totals.written_count);
    const answerCount = Number(totals.answer_count);
    const gradedCount = Number(totals.graded_count);
    const totalPoints = Number(totals.total_points);
    const questionCount = Number(req.user.question_quota);
    const maxPoints = answerCount * LETTER_POINTS.A;
    const gradedMaxPoints = gradedCount * LETTER_POINTS.A;

    res.json({
      answers,
      scale: LETTER_POINTS,
      pagination: {
        page,
        limit,
        total: answerCount,
        pages: Math.max(1, Math.ceil(answerCount / limit)),
      },
      summary: {
        writtenCount,
        answerCount,
        questionCount,
        gradedCount,
        totalPoints,
        maxPoints,
        percent: gradedMaxPoints ? Math.round((totalPoints / gradedMaxPoints) * 100) : 0,
      },
    });
  }),
);

router.put(
  '/:answerId',
  asyncHandler(async (req, res) => {
    const answerId = v.uuidLike(req.params.answerId, 'Answer id');
    const letter = v.oneOf(req.body.letter, 'Grade', LETTERS);
    const note = v.str(req.body.note, 'Note', { max: 500, required: false });

    const answer = await queryOne(
      'SELECT * FROM answers WHERE id = :id AND user_id = :userId LIMIT 1',
      { id: answerId, userId: req.user.id },
    );
    if (!answer) throw notFound('Answer not found');

    const points = LETTER_POINTS[letter];
    await query(
      `INSERT INTO grades (id, answer_id, title_id, user_id, letter, points, note)
       VALUES (:id, :answerId, :titleId, :userId, :letter, :points, :note)
       ON DUPLICATE KEY UPDATE letter = VALUES(letter), points = VALUES(points), note = VALUES(note)`,
      {
        id: uuid(),
        answerId,
        titleId: answer.title_id,
        userId: req.user.id,
        letter,
        points,
        note,
      },
    );

    res.json({ grade: { answerId, letter, points, note } });
  }),
);

export default router;
