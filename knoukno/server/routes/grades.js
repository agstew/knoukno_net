const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Answer = require('../models/Answer');
const Title = require('../models/Title');
const questions = require('../data/questions');

const gradePoints = { A: 5, B: 4, C: 3, D: 2, F: 0 };
const tierDenominators = { free: 5, member: 50, pro: 75, bonus: 100 };

// POST /api/answers — save or update an answer
router.post('/answers', protect, async (req, res) => {
  try {
    const { titleId, questionId, answerText, grade } = req.body;
    const title = await Title.findOne({ _id: titleId, userId: req.user._id });
    if (!title) return res.status(404).json({ message: 'Title not found' });
    const q = questions.find(q => q.id === parseInt(questionId));
    const points = gradePoints[grade] !== undefined ? gradePoints[grade] : 0;
    const answer = await Answer.findOneAndUpdate(
      { userId: req.user._id, titleId, questionId },
      { answerText, grade, gradePoints: points, questionText: q ? q.text : '' },
      { upsert: true, new: true }
    );
    const completedAnswers = await Answer.countDocuments({ titleId, userId: req.user._id, grade: { $ne: '' } });
    await Title.findByIdAndUpdate(titleId, { completedQuestions: completedAnswers });
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/answers/:titleId
router.get('/answers/:titleId', protect, async (req, res) => {
  try {
    const title = await Title.findOne({ _id: req.params.titleId, userId: req.user._id });
    if (!title) return res.status(404).json({ message: 'Title not found' });
    const answers = await Answer.find({ titleId: req.params.titleId, userId: req.user._id });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/grades/calculate
router.post('/grades/calculate', protect, async (req, res) => {
  try {
    const { titleId } = req.body;
    const title = await Title.findOne({ _id: titleId, userId: req.user._id });
    if (!title) return res.status(404).json({ message: 'Title not found' });
    const answers = await Answer.find({ titleId, userId: req.user._id, grade: { $ne: '' } });
    const totalGradePoints = answers.reduce((sum, a) => sum + a.gradePoints, 0);
    const denominator = tierDenominators[title.tier] || 5;
    const averageScore = Math.round((totalGradePoints / (denominator * 5)) * 100);
    let overallGrade = 'F';
    if (averageScore >= 90) overallGrade = 'A';
    else if (averageScore >= 80) overallGrade = 'B';
    else if (averageScore >= 70) overallGrade = 'C';
    else if (averageScore >= 60) overallGrade = 'D';
    const updated = await Title.findByIdAndUpdate(
      titleId,
      { totalGradePoints, averageScore, overallGrade, completedQuestions: answers.length },
      { new: true }
    );
    res.json({ title: updated, totalGradePoints, averageScore, overallGrade });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/grades/:titleId
router.get('/grades/:titleId', protect, async (req, res) => {
  try {
    const title = await Title.findOne({ _id: req.params.titleId, userId: req.user._id });
    if (!title) return res.status(404).json({ message: 'Title not found' });
    res.json({ title, totalGradePoints: title.totalGradePoints, averageScore: title.averageScore, overallGrade: title.overallGrade });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rates/save
router.post('/rates/save', protect, async (req, res) => {
  try {
    const { titleId, rates } = req.body;
    const title = await Title.findOne({ _id: titleId, userId: req.user._id });
    if (!title) return res.status(404).json({ message: 'Title not found' });
    const ops = rates.map(r => ({
      updateOne: {
        filter: { userId: req.user._id, titleId, questionId: r.questionId },
        update: { ratePosition: r.ratePosition },
        upsert: true
      }
    }));
    await Answer.bulkWrite(ops);
    res.json({ message: 'Rates saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rates/:titleId
router.get('/rates/:titleId', protect, async (req, res) => {
  try {
    const title = await Title.findOne({ _id: req.params.titleId, userId: req.user._id });
    if (!title) return res.status(404).json({ message: 'Title not found' });
    const answers = await Answer.find({ titleId: req.params.titleId, userId: req.user._id });
    res.json(answers.map(a => ({ questionId: a.questionId, ratePosition: a.ratePosition })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
