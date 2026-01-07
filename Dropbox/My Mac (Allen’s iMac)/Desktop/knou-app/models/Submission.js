const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  question: { type: String, required: false },
  userId: { type: String, required: false },
  answers: { type: Array, default: [] },
  grade: { type: Number, required: false },
  rated: { type: Boolean, default: false },
  ratings: { type: [Number], default: [] },
  average: { type: Number, default: 0 },
  savedAt: { type: Date, default: Date.now },
}, { timestamps: true });

SubmissionSchema.methods.addAnswers = function(newAnswers){
  if (!Array.isArray(newAnswers)) return this;
  this.answers = this.answers.concat(newAnswers);
  this.savedAt = new Date();
  return this.save();
};

SubmissionSchema.methods.setGrade = function(grade){
  this.grade = typeof grade === 'number' ? grade : this.grade;
  this.savedAt = new Date();
  return this.save();
};

SubmissionSchema.methods.addRating = function(rating){
  if (typeof rating !== 'number') return this;
  this.ratings.push(rating);
  this.rated = true;
  // recalc average
  const sum = this.ratings.reduce((s, r) => s + r, 0);
  this.average = this.ratings.length ? sum / this.ratings.length : 0;
  this.savedAt = new Date();
  return this.save();
};

SubmissionSchema.methods.saveAll = function({ answers, grade, rating }){
  if (Array.isArray(answers)) this.answers = answers;
  if (typeof grade === 'number') this.grade = grade;
  if (typeof rating === 'number') this.ratings.push(rating);
  if (this.ratings.length){
    const sum = this.ratings.reduce((s, r) => s + r, 0);
    this.average = sum / this.ratings.length;
    this.rated = true;
  }
  this.savedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Submission', SubmissionSchema);
