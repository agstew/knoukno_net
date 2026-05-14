const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Title', required: true },
  questionId: { type: Number, required: true },
  questionText: { type: String },
  answerText: { type: String, default: '' },
  grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F', ''], default: '' },
  gradePoints: { type: Number, default: 0 },
  ratePosition: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
