const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('./models/Question');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/kno';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => seed())
  .catch(err => console.error(err));

async function seed(){
  console.log('Seeding questions...');
  await Question.deleteMany({});
  const categories = [
    { key: 'start', title: 'How to start a business' },
    { key: 'manage', title: 'How to manage a business' },
    { key: 'money', title: 'How to manage money in your business' }
  ];
  const all = [];
  // Create 175 questions per category (3 categories -> 525 total)
  const PER_CATEGORY = 175;
  let counter = 1;
  for (const cat of categories) {
    for (let i = 1; i <= PER_CATEGORY; i++) {
      // Build different phrasing so items are unique
      const text = `${cat.title} — Q${i}: ${generateQuestionText(cat.key, i)}`;
      const example = generateExample(cat.key, i);
      all.push({ text, category: cat.key, example });
      counter++;
    }
  }
  await Question.insertMany(all);
  console.log(`Inserted ${all.length} questions (${PER_CATEGORY} per category)`);
  process.exit(0);
}

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
