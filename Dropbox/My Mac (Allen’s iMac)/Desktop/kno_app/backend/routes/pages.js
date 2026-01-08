const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const SavedPage = require('../models/SavedPage');
const requireAuth = require('../middleware/auth');
const tier = require('../middleware/tier');

router.get('/', (req, res) => {
  const homeText = `Kno U Kno helps founders and managers with clear, practical questions and examples about starting and running a business.`;
  res.render('index', { title: 'Kno U Kno', homeText });
});

router.get('/about', (req, res) => res.render('about'));

router.get('/pricing', requireAuth, (req, res) => res.render('pricing'));

// Dashboard for authenticated users
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { user: res.locals.currentUser });
});

router.get('/questions', requireAuth, tier.checkQuestionAccess, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '1'));
  const skip = (page - 1) * limit;
  const total = await Question.countDocuments();
  const q = await Question.find().skip(skip).limit(limit);
  // compute average ratings for returned questions
  const questionIds = q.map(x => x._id);
  const averages = await Submission.aggregate([
    { $match: { question: { $in: questionIds }, rating: { $ne: null } } },
    { $group: { _id: '$question', avgRating: { $avg: '$rating' } } }
  ]);
  const avgMap = {};
  averages.forEach(a => { avgMap[a._id.toString()] = a.avgRating; });
  // fetch paginated answers for the displayed questions (default answers per question)
  const answersPage = Math.max(1, parseInt(req.query.answersPage || '1'));
  const answersLimit = Math.max(1, parseInt(req.query.answersLimit || '5'));
  const submissionsMap = {};
  const submissionsCount = {};
  for (const question of q){
    const cnt = await Submission.countDocuments({ question: question._id });
    const subs = await Submission.find({ question: question._id }).limit(answersLimit).skip((answersPage-1)*answersLimit).sort('-createdAt');
    submissionsMap[question._id] = subs;
    submissionsCount[question._id] = cnt;
  }

  res.render('questions', { questions: q, page, limit, total, user: req.currentUser, avgMap, submissionsMap, submissionsCount, answersPage, answersLimit });
});

// Show a single question by 1-based index across all questions
router.get('/questions/num/:n', requireAuth, tier.checkQuestionAccess, async (req, res) => {
  const n = Math.max(1, parseInt(req.params.n || '1'));
  const total = await Question.countDocuments();
  if (n > total) return res.status(404).send('Question not found');
  const q = await Question.find().skip(n - 1).limit(1);
  const question = q[0];
  const avg = await Submission.aggregate([
    { $match: { question: question._id, rating: { $ne: null } } },
    { $group: { _id: '$question', avgRating: { $avg: '$rating' } } }
  ]);
  const avgRating = (avg[0] && avg[0].avgRating) ? avg[0].avgRating : null;
  res.render('questions', { questions: [question], page: n, limit: 1, total, user: req.currentUser, avgMap: { [question._id]: avgRating } });
});


// Show a question by id (renders same questions view with single item)
router.get('/questions/id/:id', requireAuth, tier.checkQuestionAccess, async (req, res) => {
  const id = req.params.id;
  const question = await Question.findById(id);
  if (!question) return res.status(404).send('Question not found');
  const total = await Question.countDocuments();
  const avg = await Submission.aggregate([
    { $match: { question: question._id, rating: { $ne: null } } },
    { $group: { _id: '$question', avgRating: { $avg: '$rating' } } }
  ]);
  const avgRating = (avg[0] && avg[0].avgRating) ? avg[0].avgRating : null;
  res.render('questions', { questions: [question], page: 1, limit: 1, total, user: req.currentUser, avgMap: { [question._id]: avgRating } });
});

// View paginated answers for any question (clients)
router.get('/questions/:id/answers', requireAuth, async (req, res) => {
  const questionId = req.params.id;
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '10'));
  const skip = (page - 1) * limit;
  const total = await Submission.countDocuments({ question: questionId });
  const submissions = await Submission.find({ question: questionId }).limit(limit).skip(skip).sort('-createdAt');
  const mongoose = require('mongoose');
  const agg = await Submission.aggregate([
    { $match: { question: new mongoose.Types.ObjectId(questionId), rating: { $ne: null } } },
    { $group: { _id: '$question', avgRating: { $avg: '$rating' } } }
  ]);
  const avgRating = (agg[0] && agg[0].avgRating) ? agg[0].avgRating : null;
  res.render('answers', { submissions, page, limit, total, avgRating, questionId });
});

router.post('/questions/answer', requireAuth, tier.consumeQuestion, require('../middleware/validators').answer, (req, res, next) => require('../middleware/validators').check('questions')(req, res, next), async (req, res) => {
  const { questionId, answerText, name } = req.body;
  await Submission.create({ question: questionId, answerText, name });
  res.redirect('/questions');
});

// Save current question page for the user
router.post('/questions/save-page', requireAuth, require('../middleware/validators').savePage, (req, res, next) => require('../middleware/validators').check('questions')(req, res, next), async (req, res) => {
  const { questionId } = req.body;
  await SavedPage.create({ user: req.user.id, question: questionId });
  const backURL = req.get('Referrer') || '/';
  res.redirect(backURL);
});

router.get('/admin', requireAuth, async (req, res) => {
  const total = await Question.countDocuments();
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '25'));
  const skip = (page - 1) * limit;
  const submissionsTotal = await Submission.countDocuments();
  const submissions = await Submission.find().limit(limit).skip(skip).sort('-createdAt');
  res.render('admin', { total, submissions, page, limit, submissionsTotal });
});

module.exports = router;
