const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

describe('auth middleware', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.get('/test', auth, (req, res) => res.json({ user: req.user }));
  });

  test('rejects missing token', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('rejects invalid token', async () => {
    const res = await request(app).get('/test').set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('accepts valid token and sets req.user', async () => {
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET || 'devsecret');
    const res = await request(app).get('/test').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe('user123');
  });
});
