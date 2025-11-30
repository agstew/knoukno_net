const request = require('supertest');
const base = process.env.TEST_SERVER_URL || 'http://127.0.0.1:5002';

describe('Admin', () => {
  let token;
  beforeAll(async () => {
    const res = await request(base).post('/auth/login').send({ email: 'demo@localhost', password: 'password123' });
    token = res.body.token;
  });

  test('GET /admin/users returns array', async () => {
    const res = await request(base).get('/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});
