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

test('Admin save-all and bulk grade/rate apply to multiple submissions', async () => {
  const q = await Question.findOne() || await Question.create({ text: 'Bulk Q', category: 'start', example: 'ex' });

  // create admin user
  const email = 'bulkadmin@test.example';
  const password = 'password123';
  await request(app).post('/auth/register').type('form').send({ name: 'Bulk Admin', email, password });
  const user = await User.findOne({ email });
  user.role = 'admin';
  await user.save();

  const agent = request.agent(app);
  await agent.post('/auth/login').type('form').send({ email, password });

  // create multiple submissions
  for (let i=0;i<4;i++){
    await agent.post('/questions/answer').type('form').send({ questionId: q._id.toString(), answerText: `Bulk answer ${i}` });
  }
  const subs = await Submission.find({ question: q._id });
  expect(subs.length).toBeGreaterThanOrEqual(4);

  // call save-all
  const saveAll = await agent.post('/admin/save-all').type('form').send();
  expect([302,200]).toContain(saveAll.status);
  const savedCount = await Submission.countDocuments({ question: q._id, saved: true });
  expect(savedCount).toBeGreaterThanOrEqual(4);

  // bulk grade: mark page 1 grade B
  const bulkGrade = await agent.post('/admin/bulk/save-grade').type('form').send({ page:1, limit:25, grade:'B' });
  expect([302,200]).toContain(bulkGrade.status);
  const gradedCount = await Submission.countDocuments({ question: q._id, graded: true });
  expect(gradedCount).toBeGreaterThanOrEqual(4);

  // bulk rate
  const bulkRate = await agent.post('/admin/bulk/save-rated').type('form').send({ page:1, limit:25, rating:4 });
  expect([302,200]).toContain(bulkRate.status);
  const ratedCount = await Submission.countDocuments({ question: q._id, rated: true });
  expect(ratedCount).toBeGreaterThanOrEqual(4);
});
