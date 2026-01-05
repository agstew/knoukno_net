const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  entitlements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entitlement' }]
});
UserSchema.index({ stripeCustomerId: 1 });

// store stripe customer id for linking purchases
UserSchema.add({ stripeCustomerId: { type: String, index: true, sparse: true } });

module.exports = mongoose.model('User', UserSchema);
