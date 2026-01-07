const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
let mongod;
let serverModule;
let request;

jest.setTimeout(30000);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  process.env.PORT = '0';
  // require server after setting env
  serverModule = require('../server');
  request = require('supertest')(serverModule.app);
});

afterAll(async () => {
  try { await serverModule.closeServer(); } catch (e) { /* ignore */ }
  if (mongod) await mongod.stop();
});

test('create, list, append answers, add rating, delete submission', async () => {
  const token = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_SECRET);

  // Create
  const createRes = await request.post('/api/submissions')
    .set('Authorization', `Bearer ${token}`)
    .send({ question: 'Q1', answers: ['a1'] })
    .expect(200);
  const sub = createRes.body;
  expect(sub).toHaveProperty('_id');
  expect(sub.question).toBe('Q1');

  // List (should include our submission)
  const listRes = await request.get('/api/submissions')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  expect(Array.isArray(listRes.body)).toBe(true);
  expect(listRes.body.length).toBeGreaterThanOrEqual(1);

  // Append answers
  await request.put(`/api/submissions/${sub._id}/answers`)
    .set('Authorization', `Bearer ${token}`)
    .send({ answers: ['a2','a3'] })
    .expect(200);

  const got = await request.get(`/api/submissions/${sub._id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  expect(got.body.answers.length).toBeGreaterThanOrEqual(3);

  // Add rating
  await request.put(`/api/submissions/${sub._id}/rating`)
    .set('Authorization', `Bearer ${token}`)
    .send({ rating: 5 })
    .expect(200);

  const got2 = await request.get(`/api/submissions/${sub._id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  expect(got2.body.ratings.length).toBeGreaterThanOrEqual(1);
  expect(typeof got2.body.average).toBe('number');

  // Delete
  const delRes = await request.delete(`/api/submissions/${sub._id}`)
    .set('Authorization', `Bearer ${token}`);
  // log for debugging when something goes wrong
  console.log('delete res', delRes.status, delRes.body, delRes.text);
  expect(delRes.status).toBe(200);

  await request.get(`/api/submissions/${sub._id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404);
});
