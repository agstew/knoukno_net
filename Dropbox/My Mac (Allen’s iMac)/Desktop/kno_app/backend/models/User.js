const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  // Membership fields
  tier: { type: String, enum: ['free','members','pro'], default: 'free' },
  tierExpires: { type: Date, default: () => new Date(Date.now() + 3*24*3600*1000) },
  questionsRemaining: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
