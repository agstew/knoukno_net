import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwtAuth from '../middleware/jwtAuth.mjs';
import requireRole from '../middleware/requireRole.mjs';

const prisma = new PrismaClient();
const router = Router();

// All admin routes require authentication and ADMIN role
router.use(jwtAuth);
router.use(requireRole('ADMIN'));

// GET /admin/users - list users (no passwords)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
    res.json({ ok: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /admin/users - create user { email, password, name, role }
router.post('/users', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'email_taken' });
    const hash = await import('bcryptjs').then(m => m.default.hash(password, 10));
    const u = await prisma.user.create({ data: { email, password: hash, name, role: role || 'USER' } });
    res.json({ ok: true, user: { id: u.id, email: u.email, name: u.name, role: u.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// DELETE /admin/users/:id - delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'bad_id' });
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /admin/users/:id/role - change role { role }
router.post('/users/:id/role', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'bad_id' });
    if (!role || typeof role !== 'string') return res.status(400).json({ error: 'bad_role' });
    const user = await prisma.user.update({ where: { id }, data: { role } });
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

export default router;
