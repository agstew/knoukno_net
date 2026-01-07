const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Tier = require('../models/Tier');

let mongod, serverModule, request;

jest.setTimeout(30000);

// Mock stripe before requiring server so the route uses the mock
const mockCreate = jest.fn().mockResolvedValue({ url: 'https://stripe.mock/checkout/session_123' });
const mockStripe = jest.fn(() => ({ checkout: { sessions: { create: mockCreate } } }));
jest.mock('stripe', () => mockStripe);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  process.env.PORT = '0';
  process.env.STRIPE_SECRET = 'sk_test_abc';

  serverModule = require('../server');
  request = require('supertest')(serverModule.app);
});

afterAll(async () => {
  try { await serverModule.closeServer(); } catch (e) {}
  if (mongod) await mongod.stop();
});

test('create checkout session for tier uses Stripe and returns url', async () => {
  const tier = await Tier.create({ name: 'Members', price: 39.00, questionsCount: 50, durationDays: 30 });

  const res = await request.post('/api/checkout/create-session')
    .send({ tierId: tier._id })
    .expect(200);

  expect(res.body).toHaveProperty('url');
  expect(res.body.url).toMatch(/^https?:\/\//);
  expect(mockStripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET);
  expect(mockCreate).toHaveBeenCalled();
});
