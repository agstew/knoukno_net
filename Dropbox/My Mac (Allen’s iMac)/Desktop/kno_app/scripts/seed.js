require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kno_app';

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  const users = [
    { email: 'alice@example.com', password: 'password123' },
    { email: 'bob@example.com', password: 'password123' }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log('Skipping existing', u.email);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 10);
    const user = new User({ email: u.email, password: hash });
    await user.save();
    console.log('Created user', u.email);
  }

  await mongoose.disconnect();
  console.log('Seeding complete');
}

seed().catch(err => { console.error(err); process.exit(1); });
