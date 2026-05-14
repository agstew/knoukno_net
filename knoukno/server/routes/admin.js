const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Title = require('../models/Title');
const Answer = require('../models/Answer');
const questions = require('../data/questions');

router.use(protect, requireAdmin);

router.get('/overview', async (req, res) => {
  try {
    const [users, titles, answers] = await Promise.all([
      User.countDocuments(),
      Title.countDocuments(),
      Answer.countDocuments()
    ]);
    res.json({ users, titles, answers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/questions', (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '1', 10), 1), 25);
  const start = (page - 1) * limit;
  res.json({
    page,
    limit,
    total: questions.length,
    questions: questions.slice(start, start + limit)
  });
});

router.get('/answers', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const answers = await Answer.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email tier')
      .populate('titleId', 'name tier');
    const total = await Answer.countDocuments();
    res.json({ page, limit, total, answers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
