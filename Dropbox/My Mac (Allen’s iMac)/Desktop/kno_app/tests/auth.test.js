jest.mock('../models/User');
const request = require('supertest');
const User = require('../models/User');
const app = require('../server');

describe('Auth routes', () => {
  beforeEach(() => {
    // reset mocks
    User.findOne = jest.fn();
    User.mockClear && User.mockClear();
  });

  test('register creates a user and returns token', async () => {
    User.findOne.mockResolvedValue(null);
    // mock constructor to provide save
    User.mockImplementationOnce(function (doc) {
      this.email = doc.email; this.password = doc.password; this.save = jest.fn().mockResolvedValue({ _id: '123', email: doc.email });
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'pass1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('login with valid credentials returns token', async () => {
    const hashed = require('bcryptjs').hashSync('pass1234', 10);
    User.findOne.mockResolvedValue({ _id: 'u1', email: 't@example.com', password: hashed });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 't@example.com', password: 'pass1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
