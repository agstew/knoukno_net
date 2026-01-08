const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  answerText: { type: String },
  name: { type: String },
  // admin-managed fields
  saved: { type: Boolean, default: false },
  graded: { type: Boolean, default: false },
  grade: { type: Number, default: null },
  rated: { type: Boolean, default: false },
  rating: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
