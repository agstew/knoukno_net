const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect, adminOnly } = require('../middleware/auth');
const { tierLimits } = require('../middleware/tier');

// GET /api/questions/titles - public
router.get('/titles', async (req, res) => {
  try {
    const titles = await Question.distinct('businessTitle', { isActive: true });
    res.json(titles);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/questions - protected
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;
    const businessTitle = req.query.businessTitle || '';

    let tierFilter = ['free'];
    if (user.tier === 'members') tierFilter = ['free', 'members'];
    if (user.tier === 'pro') tierFilter = ['free', 'members', 'pro'];
    if (user.role === 'admin') tierFilter = ['free', 'members', 'pro'];

    const query = { isActive: true, tierAccess: { $in: tierFilter } };
    if (businessTitle) query.businessTitle = businessTitle;

    const maxQuestions = user.role === 'admin' ? 9999 : tierLimits[user.tier] || 5;

    const total = await Question.countDocuments(query);
    const effectiveTotal = Math.min(total, maxQuestions);

    const skip = (page - 1) * limit;
    if (skip >= effectiveTotal && effectiveTotal > 0) {
      return res.json({ questions: [], total: effectiveTotal, page, pages: Math.ceil(effectiveTotal / limit) });
    }

    const questions = await Question.find(query)
      .sort({ questionNumber: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      questions,
      total: effectiveTotal,
      page,
      pages: Math.ceil(effectiveTotal / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/questions/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question || !question.isActive) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/questions
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/questions/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/questions/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Question deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
