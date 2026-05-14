const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answerText: { type: String },
  grade: { type: Number, min: 0, max: 100 },
  rating: { type: Number, min: 1, max: 5 },
  savedAt: { type: Date, default: Date.now },
  businessTitle: { type: String },
  isSaved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Answer', answerSchema);
