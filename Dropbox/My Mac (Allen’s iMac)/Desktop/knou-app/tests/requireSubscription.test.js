jest.mock('../models/User');
jest.mock('../models/Answer');

const express = require('express');
const request = require('supertest');

const User = require('../models/User');
const Answer = require('../models/Answer');

const requireSubscription = require('../middleware/requireSubscription');

describe('requireSubscription middleware', () => {
  let app;
  beforeEach(()=>{
    app = express();
    app.get('/protected', (req,res,next)=>{ req.user = { id: 'u1' }; next(); }, requireSubscription, (req,res)=>res.json({ ok: true }));
  });

  test('allows active subscription', async () => {
    User.findById.mockResolvedValue({ _id:'u1', subscriptionStatus: 'active' });
    const res = await request(app).get('/protected');
    expect(res.status).toBe(200);
  });

  test('allows free tier under limit', async () => {
    User.findById.mockResolvedValue({ _id:'u1', subscriptionStatus: 'none', tier: { name: 'Free', questionsCount: 5, durationDays: 3 } });
    Answer.countDocuments.mockResolvedValue(2);
    const res = await request(app).get('/protected');
    expect(res.status).toBe(200);
  });

  test('blocks free tier when over limit', async () => {
    User.findById.mockResolvedValue({ _id:'u1', subscriptionStatus: 'none', tier: { name: 'Free', questionsCount: 1, durationDays: 3 } });
    Answer.countDocuments.mockResolvedValue(2);
    const res = await request(app).get('/protected');
    expect(res.status).toBe(402);
  });
});
