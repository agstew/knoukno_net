const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;
let mongod;
const User = require('../models/User');
const Entitlement = require('../models/Entitlement');

jest.setTimeout(20000);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  app = require('../server');
  await app.connectToMongo(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  // clear db
  await User.deleteMany({});
  await Entitlement.deleteMany({});
});

test('free checkout creates entitlement and links to existing user by email', async () => {
  const user = new User({ email: 'test@example.com', password: 'hashed' });
  await user.save();

  const res = await request(app)
    .post('/api/pay/create-checkout-session')
    .send({ tier: 'free', email: 'test@example.com' })
    .expect(200);

  expect(res.body.ok).toBe(true);
  const ent = await Entitlement.findOne({ email: 'test@example.com' });
  expect(ent).toBeTruthy();
  expect(String(ent.userId)).toEqual(String(user._id));

  const updatedUser = await User.findById(user._id);
  expect(updatedUser.entitlements && updatedUser.entitlements.length).toBeGreaterThan(0);
});

test('webhook creates entitlement and links to user by email; admin can list and delete', async () => {
  const adminKey = 'admintestkey';
  process.env.ADMIN_KEY = adminKey;
  // Ensure webhook secret is not set so the test uses JSON parsing path
  process.env.STRIPE_WEBHOOK_SECRET = '';

  const user = new User({ email: 'webhook@example.com', password: 'h' });
  await user.save();

  // simulate stripe webhook payload (no signature) - server is tolerant when no webhook secret
  const fakeEvent = {
    id: 'evt_test_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        metadata: { tier: 'bonus' },
        customer_details: { email: 'webhook@example.com' },
        amount_total: 10000
      }
    }
  };

  await request(app)
    .post('/api/pay/webhook')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(fakeEvent))
    .expect(200);

  const ent = await Entitlement.findOne({ stripeSessionId: 'cs_test_1' });
  expect(ent).toBeTruthy();
  expect(String(ent.userId)).toEqual(String(user._id));

  // Admin list
  const listRes = await request(app)
    .get('/api/admin/entitlements')
    .set('x-admin-key', adminKey)
    .expect(200);
  expect(listRes.body && Array.isArray(listRes.body.items)).toBe(true);

  // Delete via admin
  const deleteRes = await request(app)
    .delete(`/api/admin/entitlements/${ent._id}`)
    .set('x-admin-key', adminKey)
    .expect(200);

  const after = await Entitlement.findById(ent._id);
  expect(after).toBeNull();
});
