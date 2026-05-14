const mongoose = require('mongoose');

const titleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  tier: { type: String, enum: ['free', 'member', 'pro', 'bonus'], required: true },
  totalQuestions: { type: Number },
  completedQuestions: { type: Number, default: 0 },
  totalGradePoints: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  overallGrade: { type: String, default: '' },
  isPrinted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Title', titleSchema);
