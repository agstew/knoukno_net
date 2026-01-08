const express = require('express');
const router = express.Router();
const Title = require('../models/Title');
const TitleSubmission = require('../models/TitleSubmission');
const requireAuth = require('../middleware/auth');
const tier = require('../middleware/tier');
const mongoose = global.mongoose || require('mongoose');
global.mongoose = mongoose;
const User = require('../models/User');

// List titles
router.get('/', async (req, res) => {
  const titles = await Title.find().sort('-createdAt').limit(200);
  res.render('titles', { titles, user: res.locals.currentUser });
});

// Create a title (form POST)
router.post('/', requireAuth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.redirect('/titles');
  await Title.create({ title });
  res.redirect('/titles');
});

// View a title
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('Not found');
  const title = await Title.findById(id);
  if (!title) return res.status(404).send('Not found');

  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '10'));
  const skip = (page-1)*limit;
  const total = await TitleSubmission.countDocuments({ title: id });
  const submissions = await TitleSubmission.find({ title: id }).limit(limit).skip(skip).sort('-createdAt').populate('user');

  const agg = await TitleSubmission.aggregate([
    { $match: { title: mongoose.Types.ObjectId(id), rating: { $ne: null } } },
    { $group: { _id: '$title', avgRating: { $avg: '$rating' } } }
  ]);
  const avgRating = (agg[0] && agg[0].avgRating) ? agg[0].avgRating : null;

  res.render('title', { title, submissions, page, limit, total, avgRating, user: res.locals.currentUser });
});

// Save title for user
router.post('/:id/save', requireAuth, async (req, res) => {
  const id = req.params.id;
  await TitleSubmission.create({ title: id, user: req.user.id, type: 'save' });
  const backURL = req.get('Referrer') || '/';
  res.redirect(backURL);
});

// Print a title (simple printable page)
router.get('/:id/print', requireAuth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('Not found');
  const title = await Title.findById(id);
  if (!title) return res.status(404).send('Not found');
  res.render('title-print', { title });
});

// Grade page
router.get('/:id/grade', requireAuth, async (req, res) => {
  const id = req.params.id;
  const title = await Title.findById(id);
  if (!title) return res.redirect('/titles');
  // Only members and pro can grade
  const user = await User.findById(req.user.id);
  if (!user || (user.tier !== 'members' && user.tier !== 'pro')) return res.status(403).send('Upgrade required to grade');
  res.render('title-grade', { title, user: res.locals.currentUser });
});
router.post('/:id/grade', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { grade } = req.body;
  const user = await User.findById(req.user.id);
  if (!user || (user.tier !== 'members' && user.tier !== 'pro')) return res.status(403).send('Upgrade required to grade');
  const map = { A:5,B:4,C:3,D:2,F:0 };
  const val = map[grade] != null ? map[grade] : null;
  await TitleSubmission.create({ title: id, user: req.user.id, type: 'grade', grade, gradeValue: val });
  res.redirect(`/titles/${id}`);
});

// Rate page
router.get('/:id/rate', requireAuth, async (req, res) => {
  const id = req.params.id;
  const title = await Title.findById(id);
  if (!title) return res.redirect('/titles');
  const user = await User.findById(req.user.id);
  if (!user) return res.status(403).send('Upgrade required to rate');
  const max = user.tier === 'pro' ? 75 : (user.tier === 'members' ? 50 : 0);
  if (max === 0) return res.status(403).send('Upgrade required to rate');
  res.render('title-rate', { title, user: res.locals.currentUser, maxAllowed: max });
});
router.post('/:id/rate', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { rating } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(403).send('Upgrade required to rate');
  const max = user.tier === 'pro' ? 75 : (user.tier === 'members' ? 50 : 0);
  const r = Number(rating);
  if (isNaN(r) || r < 1 || r > max) return res.status(400).send(`Rating must be between 1 and ${max}`);
  await TitleSubmission.create({ title: id, user: req.user.id, type: 'rate', rating: r });
  res.redirect(`/titles/${id}`);
});

// Average page
router.get('/:id/average', async (req, res) => {
  const id = req.params.id;
  const agg = await TitleSubmission.aggregate([
    { $match: { title: mongoose.Types.ObjectId(id), rating: { $ne: null } } },
    { $group: { _id: '$title', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const result = agg[0] || { avgRating: null, count: 0 };
  res.render('title-average', { id, avgRating: result.avgRating, count: result.count, user: res.locals.currentUser });
});

module.exports = router;
// (Duplicate trailing block removed - keep single router definition above.)
