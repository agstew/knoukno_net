const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

describe('auth middleware', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.get('/test', authMiddleware, (req, res) => res.json({ ok: true, user: req.user }));
  });

  test('rejects missing Authorization header', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
  });

  test('allows valid token', async () => {
    const token = jwt.sign({ id: 'user1', role: 'user' }, JWT_SECRET);
    const res = await request(app).get('/test').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe('user1');
  });
});
