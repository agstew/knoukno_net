const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');

// Create a submission
router.post('/', authMiddleware, async (req, res) => {
  try {
    const payload = {
      question: req.body.question || req.body.questionId || '',
      userId: req.user ? req.user.id : (req.body.userId || null),
      answers: Array.isArray(req.body.answers) ? req.body.answers : [],
      grade: typeof req.body.grade === 'number' ? req.body.grade : undefined,
    };
    const s = await Submission.create(payload);
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// List submissions (admin sees all, users see their own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'admin') query.userId = req.user.id;
    const items = await Submission.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single submission
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const s = await Submission.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && s.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add answers (append)
router.put('/:id/answers', authMiddleware, async (req, res) => {
  try {
    const s = await Submission.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && s.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const newAnswers = req.body.answers || req.body.newAnswers;
    await s.addAnswers(Array.isArray(newAnswers) ? newAnswers : [newAnswers]);
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Set grade
router.put('/:id/grade', authMiddleware, async (req, res) => {
  try {
    const s = await Submission.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    // only owner or admin can set grade
    if (req.user.role !== 'admin' && s.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const grade = req.body.grade;
    await s.setGrade(typeof grade === 'number' ? grade : s.grade);
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add rating
router.put('/:id/rating', authMiddleware, async (req, res) => {
  try {
    const s = await Submission.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    const rating = req.body.rating;
    if (typeof rating !== 'number') return res.status(400).json({ message: 'Invalid rating' });
    await s.addRating(rating);
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Save multiple fields at once
router.put('/:id/saveAll', authMiddleware, async (req, res) => {
  try {
    const s = await Submission.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && s.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await s.saveAll({ answers: req.body.answers, grade: req.body.grade, rating: req.body.rating });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const s = await Submission.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && s.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await s.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
