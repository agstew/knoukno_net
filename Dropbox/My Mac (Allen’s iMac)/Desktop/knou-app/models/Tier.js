const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  questionsCount: { type: Number },
  durationDays: { type: Number },
  discountPercent: { type: Number, default: 0 },
  bonus: { type: String },
  // Optional Stripe Price ID for subscription checkout
  stripePriceId: { type: String }
});

module.exports = mongoose.model('Tier', tierSchema);
