const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['blast', 'individual', 'daily'], required: true },
  subject: { type: String },
  body: { type: String },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  dayIndex: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('EmailLog', emailLogSchema);
