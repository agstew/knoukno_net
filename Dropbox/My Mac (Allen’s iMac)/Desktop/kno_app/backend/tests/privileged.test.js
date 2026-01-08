const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
const User = require('../models/User');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  app = require('../server');
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test('Non-privileged user is blocked from admin endpoints', async () => {
  const email = 'normal@test.example';
  const password = 'password123';
  await request(app).post('/auth/register').type('form').send({ name: 'Normal User', email, password });
  const agent = request.agent(app);
  await agent.post('/auth/login').type('form').send({ email, password });

  // attempt to call save-all -> should be 403 or redirect to login
  const res = await agent.post('/admin/save-all').type('form').send();
  // either redirected to /auth/login or 403/upgrade required
  expect([302, 403, 401]).toContain(res.status);
});
