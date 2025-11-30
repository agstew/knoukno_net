import { Router } from 'express';
import db from '../db.mjs';

const router = Router();
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

router.get('/questions/__ping', (_req, res) => res.json({ ok: true }));

router.get('/questions', (req, res) => {
  const page = clamp(parseInt(req.query.page || '1', 10) || 1, 1, 1_000_000);
  const size = clamp(parseInt(req.query.page_size || '10', 10) || 10, 1, 100);
  const q = (req.query.q || '').toString().trim();

  const where = q ? 'WHERE text LIKE @like ESCAPE "\\"' : '';
  const like = '%' + q.replace(/[%_]/g, m => '\\' + m) + '%';

  const total = db.prepare(`SELECT COUNT(*) AS c FROM questions ${where}`).get({ like }).c;
  const items = db.prepare(`
    SELECT id, text
    FROM questions
    ${where}
    ORDER BY id
    LIMIT @limit OFFSET @offset
  `).all({ like, limit: size, offset: (page - 1) * size });

  res.json({ page, page_size: size, total, total_pages: Math.max(1, Math.ceil(total / size)), items });
});

router.get('/questions/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'bad_id' });
  const row = db.prepare('SELECT id, text FROM questions WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  res.json(row);
});

export default router;
