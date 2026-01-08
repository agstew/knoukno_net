const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
const User = require('../models/User');

describe('Basic integration tests', () => {
  jest.setTimeout(20000);
  const testEmail = 'test+integration@example.com';
  const testPassword = 'password123';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    // Now require the server so it uses the in-memory mongo
    app = require('../server');
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  test('GET / should return 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  test('Register and login flow', async () => {
    // remove any existing test user
    await User.deleteOne({ email: testEmail });

    // register
    const reg = await request(app)
      .post('/auth/register')
      .type('form')
      .send({ name: 'Integration Test', email: testEmail, password: testPassword });
    // should redirect to login
    expect([302, 303, 200]).toContain(reg.status);

    // login via agent to preserve cookie
    const agent = request.agent(app);
    const login = await agent
      .post('/auth/login')
      .type('form')
      .send({ email: testEmail, password: testPassword });
    expect([302, 303, 200]).toContain(login.status);

    // access dashboard
    const dash = await agent.get('/dashboard');
    expect([200, 302]).toContain(dash.status);
  });

  test('Questions access requires auth', async () => {
    const res = await request(app).get('/questions');
    // should redirect to login or return 302
    expect([302, 401]).toContain(res.status);
  });
});
