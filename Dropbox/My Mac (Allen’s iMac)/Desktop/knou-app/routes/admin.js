const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tier = require('../models/Tier');
const Stripe = require('stripe');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function adminOnly(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.user = payload; next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
}

// Admin: create question
router.post('/question', adminOnly, async (req, res) => {
  try {
    const q = await Question.create({ text: req.body.text, example: req.body.example, category: req.body.category });
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: list answers (paginated)
router.get('/answers', adminOnly, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.max(1, parseInt(req.query.limit || '20'));
  try {
    const total = await Answer.countDocuments();
    const items = await Answer.find()
      .populate('question')
      .skip((page-1)*limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json({ page, limit, total, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: grade an answer
router.post('/answer/:id/grade', adminOnly, async (req, res) => {
  try {
    const a = await Answer.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    a.grade = req.body.grade;
    await a.save();
    res.json(a);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: rate an answer (or user can do via public endpoint later)
router.post('/answer/:id/rate', adminOnly, async (req, res) => {
  try {
    const a = await Answer.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    a.rating = req.body.rating;
    await a.save();
    res.json(a);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Average grade/rating for a question
router.get('/question/:id/average', adminOnly, async (req, res) => {
  try {
    const qid = req.params.id;
    const agg = await Answer.aggregate([
      { $match: { question: require('mongoose').Types.ObjectId(qid) } },
      { $group: { _id: '$question', avgGrade: { $avg: '$grade' }, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json(agg[0] || { avgGrade: null, avgRating: null, count: 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: create tiers
router.post('/tier', adminOnly, async (req, res) => {
  try {
    const t = await Tier.create(req.body);
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: list Stripe webhook endpoints
router.get('/stripe/webhooks', adminOnly, async (req, res) => {
  try {
    const secret = process.env.STRIPE_SECRET;
    if (!secret) return res.status(400).json({ message: 'Stripe not configured' });
    const stripe = new Stripe(secret);
    const list = await stripe.webhookEndpoints.list({ limit: 100 });
    res.json(list.data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: delete a Stripe webhook endpoint by id
router.delete('/stripe/webhooks/:id', adminOnly, async (req, res) => {
  try {
    const secret = process.env.STRIPE_SECRET;
    if (!secret) return res.status(400).json({ message: 'Stripe not configured' });
    const stripe = new Stripe(secret);
    const id = req.params.id;
    const deleted = await stripe.webhookEndpoints.del(id);
    res.json(deleted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: force-reset a user's password (returns new password)
router.post('/reset-password', adminOnly, async (req, res) => {
  try {
    const email = req.body.email || process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const user = await require('../models/User').findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Create reset token and send email
    const crypto = require('crypto');
    const { sendResetEmail } = require('../utils/email');
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresMinutes = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || '60', 10);
    user.passwordResetToken = hash;
    user.passwordResetExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
    await user.save();
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontend}/reset-confirm?token=${token}&email=${encodeURIComponent(user.email)}`;
    const result = await sendResetEmail(user.email, resetUrl);
    res.json({ message: 'Password reset email sent', previewUrl: result.preview || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

// Admin: list tiers
router.get('/tiers', adminOnly, async (req, res) => {
  try {
    const tiers = await Tier.find().sort({ price: 1 });
    res.json(tiers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: get single tier
router.get('/tier/:id', adminOnly, async (req, res) => {
  try {
    const t = await Tier.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: update tier (allow updating stripePriceId and price metadata)
router.put('/tier/:id', adminOnly, async (req, res) => {
  try {
    const data = req.body;
    const t = await Tier.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
