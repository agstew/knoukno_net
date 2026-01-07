const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Saved = require('../models/Saved');
const authMiddleware = require('../middleware/auth');
const requireSubscription = require('../middleware/requireSubscription');

// GET /api/questions?page=1&limit=10
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '10'));
  try {
    const total = await Question.countDocuments();
    const items = await Question.find()
      .skip((page-1)*limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json({ page, limit, total, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Printable view of a question and its answers (protected + subscription enforcement)
router.get('/:id/print', authMiddleware, requireSubscription, async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const answers = await Answer.find({ question: q._id }).sort({ createdAt: -1 });
    // Return a simple printable JSON. Frontend can format into a print page.
    res.json({ question: q, answers });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Save an answer to a question (protected + subscription enforcement)
router.post('/:id/answer', authMiddleware, requireSubscription, async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const ans = await Answer.create({ question: q._id, user: req.user.id, text: req.body.text });
    res.json(ans);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get answers for a question with pagination
router.get('/:id/answers', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '10'));
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const total = await Answer.countDocuments({ question: q._id });
    const items = await Answer.find({ question: q._id })
      .skip((page-1)*limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json({ page, limit, total, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Grade an answer (admin or owner can grade)
router.post('/:id/grade', authMiddleware, async (req, res) => {
  try {
    const { answerId, grade } = req.body;
    if (typeof grade !== 'number') return res.status(400).json({ message: 'Invalid grade' });
    const ans = await Answer.findById(answerId);
    if (!ans) return res.status(404).json({ message: 'Answer not found' });
    // allow owner or admin
    if (ans.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    ans.grade = grade;
    await ans.save();
    // compute average grade for question
    const agg = await Answer.aggregate([
      { $match: { question: ans.question, grade: { $exists: true } } },
      { $group: { _id: '$question', avg: { $avg: '$grade' } } }
    ]);
    const avgGrade = agg[0] ? agg[0].avg : null;
    res.json({ answer: ans, averageGrade: avgGrade });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Rate an answer (any authenticated user)
router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { answerId, rating } = req.body;
    if (typeof rating !== 'number') return res.status(400).json({ message: 'Invalid rating' });
    const ans = await Answer.findById(answerId);
    if (!ans) return res.status(404).json({ message: 'Answer not found' });
    ans.rating = rating;
    await ans.save();
    const agg = await Answer.aggregate([
      { $match: { question: ans.question, rating: { $exists: true } } },
      { $group: { _id: '$question', avg: { $avg: '$rating' } } }
    ]);
    const avgRating = agg[0] ? agg[0].avg : null;
    res.json({ answer: ans, averageRating: avgRating });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Save a question for the authenticated user
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const existing = await Saved.findOne({ user: req.user.id, question: q._id });
    if (existing) return res.json({ message: 'Already saved' });
    const s = await Saved.create({ user: req.user.id, question: q._id });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// List saved questions for authenticated user
router.get('/saved/list', authMiddleware, async (req, res) => {
  try {
    const items = await Saved.find({ user: req.user.id }).populate('question').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Remove a saved entry
router.delete('/saved/:id', authMiddleware, async (req, res) => {
  try {
    const s = await Saved.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    if (s.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await s.remove();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Save multiple answers (save-all) — accepts { answers: [{ questionId, text }] }
router.post('/save-all', authMiddleware, requireSubscription, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ message: 'Invalid payload' });
    const docs = answers.map(a => ({ question: a.questionId, user: req.user.id, text: a.text }));
    const created = await Answer.insertMany(docs);
    res.json({ createdCount: created.length, items: created });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete a question (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    await Answer.deleteMany({ question: q._id });
    await Saved.deleteMany({ question: q._id });
    await q.remove();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
