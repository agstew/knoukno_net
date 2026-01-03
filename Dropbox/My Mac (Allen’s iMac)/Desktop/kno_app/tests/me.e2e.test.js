const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await app.connectToMongo(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test('register -> login -> GET /api/me returns user', async () => {
  const email = 'e2e@example.com';
  const password = 'pass1234';

  const reg = await request(app).post('/api/auth/register').send({ email, password });
  expect(reg.statusCode).toBe(200);
  expect(reg.body).toHaveProperty('token');
  const token = reg.body.token;

  const res = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.user).toBeDefined();
  expect(res.body.user.email).toBe(email);
});
