const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const savedAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  answerText: String,
  grade: { type: Number, min: 0, max: 100 },
  rating: { type: Number, min: 1, max: 5 },
  savedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  tier: { type: String, enum: ['free', 'members', 'pro'], default: 'free' },
  tierExpiry: { type: Date },
  bonusQuestions: { type: Number, default: 0 },
  stripeCustomerId: { type: String },
  subscriptionId: { type: String },
  // none: never subscribed. active: paying and renewing. cancelled: user or PayPal
  // ended future renewals, access continues until tierExpiry. expired: access ended.
  subscriptionStatus: { type: String, enum: ['none', 'active', 'cancelled', 'expired'], default: 'none' },
  createdAt: { type: Date, default: Date.now },
  savedAnswers: [savedAnswerSchema],
  averageGrade: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  // SHA-256 of the emailed token; the raw token is never stored
  resetPasswordToken: { type: String, index: true },
  resetPasswordExpires: { type: Date },
  emailOptOut: { type: Boolean, default: false },
  emailPrefToken: { type: String, index: true }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
