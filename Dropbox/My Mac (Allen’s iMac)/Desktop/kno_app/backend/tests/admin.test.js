const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
const User = require('../models/User');
const Submission = require('../models/Submission');
const Question = require('../models/Question');

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

test('Admin can grade and rate a submission', async () => {
  // Ensure a question exists
  const q = await Question.findOne() || await Question.create({ text: 'Admin Q', category: 'start', example: 'ex' });

  const email = 'admin@test.example';
  const password = 'password123';
  // Register user
  await request(app).post('/auth/register').type('form').send({ name: 'Admin User', email, password });
  // Promote to admin in DB
  const user = await User.findOne({ email });
  user.role = 'admin';
  await user.save();

  const agent = request.agent(app);
  await agent.post('/auth/login').type('form').send({ email, password });

  // Submit an answer
  await agent.post('/questions/answer').type('form').send({ questionId: q._id.toString(), answerText: 'Admin answer' });
  const sub = await Submission.findOne({ answerText: 'Admin answer' });
  expect(sub).toBeTruthy();

  // Grade the submission
  const gradeRes = await agent.post(`/admin/grade/${sub._id}`).type('form').send({ grade: 'A' });
  expect([302, 303, 200]).toContain(gradeRes.status);
  const updated = await Submission.findById(sub._id);
  expect(updated.graded).toBeTruthy();
  expect(updated.grade).toBe(5);

  // Rate the submission
  const rateRes = await agent.post(`/admin/rate/${sub._id}`).type('form').send({ rating: 4 });
  expect([302,303,200]).toContain(rateRes.status);
  const updated2 = await Submission.findById(sub._id);
  expect(updated2.rated).toBeTruthy();
  expect(updated2.rating).toBe(4);
});
