#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node backend/scripts/promoteAdmin.js you@example.com');
  process.exit(1);
}

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/knoukno';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const user = await User.findOne({ email });
  if (!user) {
    console.error('User not found:', email);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Promote safely: set `isAdmin` and `role` where present
  user.isAdmin = true;
  try { user.role = 'admin'; } catch (e) {}

  await user.save();
  console.log('Promoted user to admin:', email);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
