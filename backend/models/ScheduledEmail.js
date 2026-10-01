const mongoose = require('mongoose');

const scheduledEmailSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  sendAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed', 'cancelled'], default: 'pending' },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

module.exports = mongoose.model('ScheduledEmail', scheduledEmailSchema);
