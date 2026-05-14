const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/answers
router.get('/answers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = await Answer.countDocuments();
    const answers = await Answer.find()
      .populate('userId', 'name email tier')
      .populate('questionId', 'businessTitle questionText category')
      .sort({ savedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ answers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/questions
router.get('/questions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = await Question.countDocuments();
    const questions = await Question.find()
      .sort({ questionNumber: 1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ questions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/questions
router.post('/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/questions/:id
router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const freeUsers = await User.countDocuments({ tier: 'free' });
    const membersUsers = await User.countDocuments({ tier: 'members' });
    const proUsers = await User.countDocuments({ tier: 'pro' });
    res.json({ totalUsers, totalAnswers, totalQuestions, byTier: { free: freeUsers, members: membersUsers, pro: proUsers } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
