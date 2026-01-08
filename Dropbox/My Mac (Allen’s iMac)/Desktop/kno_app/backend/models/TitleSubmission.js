const mongoose = require('mongoose');

const TitleSubmissionSchema = new mongoose.Schema({
  title: { type: mongoose.Schema.Types.ObjectId, ref: 'Title', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['save','grade','rate'], required: true },
  grade: { type: String },
  gradeValue: { type: Number },
  rating: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TitleSubmission', TitleSubmissionSchema);
