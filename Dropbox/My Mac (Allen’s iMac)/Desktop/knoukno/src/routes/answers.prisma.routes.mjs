import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwtAuth from '../middleware/jwtAuth.mjs';
import validate from '../middleware/validate.mjs';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// list answers (pagination)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const page_size = Math.min(100, Math.max(1, parseInt(req.query.page_size || '10', 10)));
    const skip = (page - 1) * page_size;

    const [total, items] = await Promise.all([
      prisma.answer.count(),
      prisma.answer.findMany({ skip, take: page_size, orderBy: { id: 'desc' } }),
    ]);

    res.json({ page, page_size, total, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// create answer
const createAnswerSchema = z.object({ questionId: z.number().int().positive(), text: z.string().min(1) });
const gradeSchema = z.object({ score: z.number().int().min(0).max(100), comment: z.string().optional() });

router.post('/', jwtAuth, validate(createAnswerSchema), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    const { questionId, text } = req.body;
    if (!questionId || !text) return res.status(400).json({ error: 'missing_fields' });

    const answer = await prisma.answer.create({ data: { questionId: Number(questionId), text: String(text), userId: Number(req.user.id) } });
    res.json({ ok: true, answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// grade an answer: POST /:id/grade { score, comment }
router.post('/:id/grade', jwtAuth, validate(gradeSchema), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    const id = Number(req.params.id);
    const { score, comment } = req.body;
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'bad_id' });
    if (typeof score !== 'number') return res.status(400).json({ error: 'bad_score' });

    const grade = await prisma.grade.create({ data: { answerId: id, score, comment: comment || null, graderId: Number(req.user.id) } });
    res.json({ ok: true, grade });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

export default router;
