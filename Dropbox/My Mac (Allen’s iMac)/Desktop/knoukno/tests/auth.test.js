const request = require('supertest');
const base = process.env.TEST_SERVER_URL || 'http://127.0.0.1:5002';

describe('Auth', () => {
  test('demo login returns token + role', async () => {
    const res = await request(base).post('/auth/login').send({ email: 'demo@localhost', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.role).toBeDefined();
  });
});
