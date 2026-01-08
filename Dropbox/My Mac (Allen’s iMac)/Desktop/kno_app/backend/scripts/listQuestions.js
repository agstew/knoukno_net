#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kno';

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const q = await Question.find().limit(20).sort('createdAt');
  console.log('First', q.length, 'questions:');
  q.forEach((item, idx) => {
    console.log(`${idx+1}. [${item.category}] ${item.text}`);
  });
  const count = await Question.countDocuments();
  console.log('\nTotal questions in DB:', count);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
