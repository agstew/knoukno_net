const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requirePrivileged = require('../middleware/privileged');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Question = require('../models/Question');

// Save a single submission
router.post('/save', requireAuth, requirePrivileged, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send('Missing id');
  await Submission.findByIdAndUpdate(id, { saved: true });
  res.redirect('/admin');
});

// Save all submissions
router.post('/save-all', requireAuth, requirePrivileged, async (req, res) => {
  await Submission.updateMany({}, { saved: true });
  res.redirect('/admin');
});

// Delete a submission
router.post('/delete', requireAuth, requirePrivileged, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send('Missing id');
  await Submission.findByIdAndDelete(id);
  res.redirect('/admin');
});

// Grade a submission (form posts grade)
router.get('/grade/:id', requireAuth, requirePrivileged, async (req, res) => {
  const s = await Submission.findById(req.params.id).populate('question');
  if (!s) return res.redirect('/admin');
  res.render('admin-grade', { submission: s });
});
router.post('/grade/:id', requireAuth, requirePrivileged, async (req, res) => {
  const { grade } = req.body;
  // Accept letter grades A/B/C/D/F and map to numeric values: A=5, B=4, C=3, D=2, F=0
  let value = null;
  if (grade) {
    const g = String(grade).toUpperCase().trim();
    const map = { A: 5, B: 4, C: 3, D: 2, F: 0 };
    if (map.hasOwnProperty(g)) value = map[g];
    else if (!isNaN(Number(grade))) value = Number(grade);
  }
  await Submission.findByIdAndUpdate(req.params.id, { graded: true, grade: value });
  res.redirect('/admin');
});

// Rate a submission
router.get('/rate/:id', requireAuth, requirePrivileged, async (req, res) => {
  const s = await Submission.findById(req.params.id).populate('question');
  if (!s) return res.redirect('/admin');
  res.render('admin-rate', { submission: s });
});
router.post('/rate/:id', requireAuth, requirePrivileged, async (req, res) => {
  const { rating } = req.body;
  await Submission.findByIdAndUpdate(req.params.id, { rated: true, rating: rating ? Number(rating) : null });
  res.redirect('/admin');
});

// Print a submission (render simple printable page)
router.get('/print/:id', requireAuth, requirePrivileged, async (req, res) => {
  const s = await Submission.findById(req.params.id).populate('question');
  if (!s) return res.redirect('/admin');
  res.render('admin-print', { submission: s });
});

// View paginated answers for a specific question (admin)
router.get('/question-answers/:questionId', requireAuth, requirePrivileged, async (req, res) => {
  const questionId = req.params.questionId;
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '25'));
  const skip = (page - 1) * limit;
  const total = await Submission.countDocuments({ question: questionId });
  const submissions = await Submission.find({ question: questionId }).limit(limit).skip(skip).sort('-createdAt');
  // compute average rating for this question
  const mongoose = require('mongoose');
  const agg = await Submission.aggregate([
    { $match: { question: new mongoose.Types.ObjectId(questionId), rating: { $ne: null } } },
    { $group: { _id: '$question', avgRating: { $avg: '$rating' } } }
  ]);
  const avgRating = (agg[0] && agg[0].avgRating) ? agg[0].avgRating : null;
  res.render('admin-answers', { submissions, page, limit, total, avgRating, questionId });
});

// Make a user free (reset tier)
router.post('/free-user', requireAuth, requirePrivileged, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send('Missing userId');
  await User.findByIdAndUpdate(userId, { tier: 'free', questionsRemaining: 5, tierExpires: new Date(Date.now() + 3*24*3600*1000) });
  res.redirect('/admin');
});

// Questions management (paginated)
router.get('/questions', requireAuth, requirePrivileged, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '25'));
  const skip = (page - 1) * limit;
  const total = await Question.countDocuments();
  const questions = await Question.find().limit(limit).skip(skip).sort('-createdAt');
  res.render('admin-questions', { questions, page, limit, total });
});

// Delete a question
router.post('/delete-question', requireAuth, requirePrivileged, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send('Missing id');
  await Question.findByIdAndDelete(id);
  res.redirect('/admin/questions');
});

// Print a question
router.get('/print-question/:id', requireAuth, requirePrivileged, async (req, res) => {
  const q = await Question.findById(req.params.id);
  if (!q) return res.redirect('/admin/questions');
  res.render('admin-question-print', { question: q });
});

// Average rating for a question (admin view)
router.get('/question-average/:id', requireAuth, requirePrivileged, async (req, res) => {
  const mongoose = require('mongoose');
  const agg = await Submission.aggregate([
    { $match: { question: mongoose.Types.ObjectId(req.params.id), rating: { $ne: null } } },
    { $group: { _id: '$question', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const result = agg[0] || { avgRating: null, count: 0 };
  res.render('admin-question-average', { id: req.params.id, avgRating: result.avgRating, count: result.count });
});

// Bulk: mark submissions on current admin submissions page as saved
router.post('/bulk/save-page', requireAuth, requirePrivileged, async (req, res) => {
  const page = Math.max(1, parseInt(req.body.page || '1'));
  const limit = Math.max(1, parseInt(req.body.limit || '25'));
  const skip = (page - 1) * limit;
  const subs = await Submission.find().limit(limit).skip(skip).sort('-createdAt').select('_id');
  const ids = subs.map(s => s._id);
  if (ids.length) await Submission.updateMany({ _id: { $in: ids } }, { saved: true });
  res.redirect(`/admin?page=${page}&limit=${limit}`);
});

// Bulk: apply grade to submissions on current page
router.post('/bulk/save-grade', requireAuth, requirePrivileged, async (req, res) => {
  const { grade } = req.body;
  const page = Math.max(1, parseInt(req.body.page || '1'));
  const limit = Math.max(1, parseInt(req.body.limit || '25'));
  const map = { A:5,B:4,C:3,D:2,F:0 };
  let value = null;
  if (grade) {
    const g = String(grade).toUpperCase().trim();
    if (map.hasOwnProperty(g)) value = map[g];
    else if (!isNaN(Number(grade))) value = Number(grade);
  }
  const skip = (page - 1) * limit;
  const subs = await Submission.find().limit(limit).skip(skip).sort('-createdAt').select('_id');
  const ids = subs.map(s => s._id);
  if (ids.length) await Submission.updateMany({ _id: { $in: ids } }, { graded: true, grade: value });
  res.redirect(`/admin?page=${page}&limit=${limit}`);
});

// Bulk: apply rating to submissions on current page
router.post('/bulk/save-rated', requireAuth, requirePrivileged, async (req, res) => {
  const rating = Number(req.body.rating) || null;
  const page = Math.max(1, parseInt(req.body.page || '1'));
  const limit = Math.max(1, parseInt(req.body.limit || '25'));
  const skip = (page - 1) * limit;
  const subs = await Submission.find().limit(limit).skip(skip).sort('-createdAt').select('_id');
  const ids = subs.map(s => s._id);
  if (ids.length) await Submission.updateMany({ _id: { $in: ids } }, { rated: true, rating });
  res.redirect(`/admin?page=${page}&limit=${limit}`);
});

// Compute average rating for a question and save to Question.avgRating
router.post('/question-average-save', requireAuth, requirePrivileged, async (req, res) => {
  const questionId = req.body.questionId;
  if (!questionId) return res.status(400).send('Missing questionId');
  const mongoose = require('mongoose');
  const agg = await Submission.aggregate([
    { $match: { question: mongoose.Types.ObjectId(questionId), rating: { $ne: null } } },
    { $group: { _id: '$question', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const result = agg[0] || { avgRating: null, count: 0 };
  await Question.findByIdAndUpdate(questionId, { avgRating: result.avgRating });
  res.redirect(req.get('Referrer') || '/admin');
});

module.exports = router;

