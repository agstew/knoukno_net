const request = require('supertest');
const app = require('../server');

describe('GET /ping', () => {
  it('responds with pong', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'pong');
  });
});

afterAll(async () => {
  const mongoose = require('mongoose');
  try {
    await mongoose.disconnect();
  } catch (err) {
    // ignore errors during disconnect
  }
});
