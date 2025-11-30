import request from 'supertest';
import app from '../src/server.mjs';

describe('Admin', () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post('/auth/login').send({ email: 'demo@localhost', password: 'password123' });
    token = res.body.token;
  });

  test('GET /admin/users returns array', async () => {
    const res = await request(app).get('/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});
