import { Router } from 'express';
const router = Router();
router.get('/session', (req, res) => res.json({ ok: true, user: null }));
export default router;
