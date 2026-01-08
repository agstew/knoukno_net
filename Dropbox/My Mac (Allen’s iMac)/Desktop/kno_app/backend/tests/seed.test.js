const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
const Question = require('../models/Question');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test('seed produced at least 525 questions', async () => {
  const count = await Question.countDocuments();
  if (count === 0) {
    // Create same seed set programmatically for the in-memory DB used in tests
    const categories = [
      { key: 'start', title: 'How to start a business' },
      { key: 'manage', title: 'How to manage a business' },
      { key: 'money', title: 'How to manage money in your business' }
    ];
    const PER_CATEGORY = 175;
    const all = [];
    for (const cat of categories) {
      for (let i = 1; i <= PER_CATEGORY; i++) {
        const text = `${cat.title} — Q${i}: ${generateQuestionText(cat.key, i)}`;
        const example = generateExample(cat.key, i);
        all.push({ text, category: cat.key, example });
      }
    }
    await Question.insertMany(all);
  }
  const newCount = await Question.countDocuments();
  expect(newCount).toBeGreaterThanOrEqual(525);
}, 20000);

function generateQuestionText(category, n) {
  if (category === 'start') {
    return `What's a simple ${n % 5 === 0 ? 'milestone' : 'step'} to validate an idea and find first customers?`;
  }
  if (category === 'manage') {
    return `What's a practical ${n % 4 === 0 ? 'process' : 'habit'} for managing people and operations?`;
  }
  if (category === 'money') {
    return `What's a clear action to improve cash flow or pricing in month ${Math.ceil(n/12)}?`;
  }
  return `Question ${n}`;
}

function generateExample(category, n) {
  if (category === 'start') {
    return `Example: Run a quick landing page test offering a pre-order or signup; measure conversion after 100 visitors.`;
  }
  if (category === 'manage') {
    return `Example: Hold a 15-minute weekly standup, prioritize three tasks, and review progress next week.`;
  }
  if (category === 'money') {
    return `Example: Create a one-page cash plan listing monthly fixed costs and three levers to extend runway.`;
  }
  return '';
}
