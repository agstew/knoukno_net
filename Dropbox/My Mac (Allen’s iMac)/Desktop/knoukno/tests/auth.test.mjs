import request from 'supertest';
import app from '../src/server.mjs';

describe('Auth', () => {
  test('demo login returns token + role', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'demo@localhost', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.role).toBeDefined();
  });
});
