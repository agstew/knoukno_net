const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, enum: ['start','manage','money'], required: true },
  example: { type: String },
  avgRating: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);
