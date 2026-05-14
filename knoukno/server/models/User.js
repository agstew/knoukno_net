const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  tier: { type: String, enum: ['free', 'member', 'pro', 'bonus'], default: 'free' },
  pendingTier: { type: String, enum: ['free', 'member', 'pro', 'bonus'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['trialing', 'pending', 'active', 'cancelled'], default: 'trialing' },
  trialEndsAt: { type: Date },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  dailyEmailIndex: { type: Number, default: 0 },
  lastEmailSent: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
