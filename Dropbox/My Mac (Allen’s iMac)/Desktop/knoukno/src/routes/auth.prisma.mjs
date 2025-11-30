import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import validate from '../middleware/validate.mjs';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });
// allow local addresses like demo@localhost used in seed/tests
const loginSchema = z.object({ email: z.string().min(1), password: z.string().min(1) });

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'email_taken' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash, name } });
    const token = signToken({ userId: user.id });
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    const token = signToken({ userId: user.id });
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// GET /auth/me
router.get('/me', async (req, res) => {
  try {
    const auth = (req.headers.authorization || '').split(' ');
    if (auth.length !== 2 || auth[0] !== 'Bearer') return res.json({ ok: true, user: null });
    const token = auth[1];
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (e) {
      return res.json({ ok: true, user: null });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.json({ ok: true, user: null });
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

export default router;
