const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
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

test('Submit an answer and retrieve it via answers endpoint', async () => {
  // Ensure there is at least one question
  const q = await Question.findOne() || await Question.create({ text: 'Test Q', category: 'start', example: 'ex' });

  // Create a test user via register
  const email = 'submit@test.example';
  await request(app).post('/auth/register').type('form').send({ name: 'Submit Test', email, password: 'password123' });

  const agent = request.agent(app);
  await agent.post('/auth/login').type('form').send({ email, password: 'password123' });

  // Post an answer
  const post = await agent.post('/questions/answer').type('form').send({ questionId: q._id.toString(), answerText: 'My answer' });
  expect([302, 303, 200]).toContain(post.status);

  // Retrieve answers for question
  const res = await agent.get(`/questions/${q._id}/answers`);
  expect(res.status).toBe(200);
  // Check that at least one submission exists
  const subs = await Submission.find({ question: q._id });
  expect(subs.length).toBeGreaterThanOrEqual(1);
});
