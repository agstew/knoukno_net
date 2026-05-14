const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const questions = require('../data/questions');
const Title = require('../models/Title');
const Answer = require('../models/Answer');

const tierLimits = { free: 5, member: 50, pro: 75, bonus: 100 };

// GET /api/questions
router.get('/questions', protect, (req, res) => {
  const limit = tierLimits[req.user.tier] || 5;
  const filtered = questions.slice(0, limit);
  res.json({ questions: filtered, total: filtered.length, tier: req.user.tier });
});

// GET /api/questions/:id
router.get('/questions/:id', protect, (req, res) => {
  const q = questions.find(q => q.id === parseInt(req.params.id));
  if (!q) return res.status(404).json({ message: 'Question not found' });
  const limit = tierLimits[req.user.tier] || 5;
  if (q.id > limit) return res.status(403).json({ message: 'Upgrade your tier to access this question' });
  res.json(q);
});

// POST /api/titles
router.post('/titles', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Title name required' });
    if (!['trialing', 'active'].includes(req.user.subscriptionStatus)) {
      return res.status(402).json({ message: 'You must subscribe before creating a business title.' });
    }
    const tier = req.user.tier;
    const totalQuestions = tierLimits[tier] || 5;
    const title = await Title.create({ userId: req.user._id, name, tier, totalQuestions });
    res.status(201).json(title);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/titles
router.get('/titles', protect, async (req, res) => {
  try {
    const titles = await Title.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(titles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/titles/:id
router.get('/titles/:id', protect, async (req, res) => {
  try {
    const title = await Title.findOne({ _id: req.params.id, userId: req.user._id });
    if (!title) return res.status(404).json({ message: 'Title not found' });
    const answers = await Answer.find({ titleId: title._id, userId: req.user._id });
    res.json({ title, answers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
