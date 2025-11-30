// src/routes/auth.js (ESM)
import { Router } from 'express';

const router = Router();

// Quick connectivity check
router.get('/__ping', (_req, res) => {
  res.json({ ok: true, router: 'auth' });
});

// Minimal demo register/login so the endpoints exist
// Replace with your real logic later.
const USERS = new Map(); // email -> { name, email, password }

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (USERS.has(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  USERS.set(email, { name, email, password });
  res.status(201).json({ ok: true });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const u = USERS.get(email);
  if (!u || u.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Dummy JWT for now; swap with real sign later
  const token = 'demo.' + Buffer.from(email).toString('base64') + '.token';
  res.json({ token });
});

export default router;
