const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let mongod, serverModule, request;
jest.setTimeout(30000);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  process.env.NODE_ENV = 'test';
  serverModule = require('../server');
  request = require('supertest')(serverModule.app);
});

afterAll(async () => {
  try { await serverModule.closeServer(); } catch (e) {}
  if (mongod) await mongod.stop();
});

test('forgot + reset password flow', async () => {
  // create a user
  const user = await User.create({ email: 'resetme@example.com', password: 'oldpass' });

  // request password reset (endpoint: /forgot-password)
  const forgotRes = await request.post('/api/auth/forgot-password').send({ email: 'resetme@example.com' }).expect(200);
  expect(forgotRes.body.message).toBeDefined();

  // the test-mode response includes previewHtml with the raw token in the reset link
  const html = forgotRes.body.previewHtml || '';
  const m = html.match(/token=([0-9a-fA-F]+)/);
  expect(m).not.toBeNull();
  const token = m[1];

  // perform reset (endpoint: /confirm-password-reset)
  const newPass = 'newpass123';
  await request.post('/api/auth/confirm-password-reset').send({ token, email: 'resetme@example.com', password: newPass }).expect(200);

  const updated = await User.findOne({ email: 'resetme@example.com' });
  expect(updated.passwordResetToken).toBeUndefined();
});
