import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAuth, requirePaidTier } from '../middleware/auth.js';
import { LETTER_POINTS, letterForAverage } from './grades.js';

const router = Router();
router.use(requireAuth, requirePaidTier);

async function computeAverage(titleId, userId) {
  const row = await queryOne(
    `SELECT
       (SELECT COUNT(*) FROM answers WHERE title_id = :titleId AND user_id = :userId) AS answer_count,
       COUNT(g.id) AS graded_count,
       COALESCE(SUM(g.points), 0) AS total_points
     FROM grades g
     WHERE g.title_id = :titleId AND g.user_id = :userId`,
    { titleId, userId },
  );

  const gradedCount = Number(row?.graded_count || 0);
  const totalPoints = Number(row?.total_points || 0);
  const average = gradedCount ? totalPoints / gradedCount : 0;

  return {
    answerCount: Number(row?.answer_count || 0),
    gradedCount,
    totalPoints,
    maxPoints: gradedCount * LETTER_POINTS.A,
    averagePoints: Number(average.toFixed(2)),
    letter: gradedCount ? letterForAverage(average) : null,
  };
}

/** Average.js — the roll-up of every grade for this business title. */
router.get(
  '/:titleId',
  asyncHandler(async (req, res) => {
    const titleId = v.uuidLike(req.params.titleId, 'Title id');
    const summary = await computeAverage(titleId, req.user.id);

    const byStage = await query(
      `SELECT q.stage, COUNT(g.id) AS graded, COALESCE(AVG(g.points), 0) AS avg_points
         FROM grades g
         JOIN answers a  ON a.id = g.answer_id
         JOIN questions q ON q.id = a.question_id
        WHERE g.title_id = :titleId AND g.user_id = :userId
        GROUP BY q.stage`,
      { titleId, userId: req.user.id },
    );

    await query(
      `INSERT INTO averages (id, title_id, user_id, answer_count, graded_count, total_points, average_points, letter)
       VALUES (:id, :titleId, :userId, :answerCount, :gradedCount, :totalPoints, :averagePoints, :letter)
       ON DUPLICATE KEY UPDATE answer_count = VALUES(answer_count), graded_count = VALUES(graded_count),
         total_points = VALUES(total_points), average_points = VALUES(average_points),
         letter = VALUES(letter), computed_at = NOW()`,
      { id: uuid(), titleId, userId: req.user.id, ...summary },
    );

    res.json({
      summary,
      byStage: byStage.map((s) => ({
        stage: s.stage,
        graded: Number(s.graded),
        averagePoints: Number(Number(s.avg_points).toFixed(2)),
      })),
      scale: LETTER_POINTS,
    });
  }),
);

export default router;
