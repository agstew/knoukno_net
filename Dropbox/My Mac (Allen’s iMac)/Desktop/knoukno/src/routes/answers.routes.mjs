import { Router } from 'express';
const router = Router();

// example endpoint (adjust to your real handlers)
router.get('/answers', (req, res) => {
  res.json({ ok: true, items: [] });
});

export default router;
