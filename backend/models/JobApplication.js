const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  position: { type: String, required: true, trim: true },
  message: { type: String, trim: true },
  status: { type: String, enum: ['new', 'reviewed', 'contacted', 'rejected', 'hired'], default: 'new' },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
