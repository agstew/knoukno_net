const mongoose = require('mongoose');

const SavedPageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedPage', SavedPageSchema);
