const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const stripeRoutes = require('./stripe');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  tier: user.tier,
  pendingTier: user.pendingTier,
  subscriptionStatus: user.subscriptionStatus,
  trialEndsAt: user.trialEndsAt,
  role: user.role
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, tier = 'free' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (!['free', 'member', 'pro', 'bonus'].includes(tier)) return res.status(400).json({ message: 'Invalid tier' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 12);
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const user = await User.create({
      name,
      email,
      password: hashed,
      tier: tier === 'free' ? 'free' : 'free',
      pendingTier: tier,
      subscriptionStatus: tier === 'free' ? 'trialing' : 'pending',
      trialEndsAt
    });

    // Fire Zapier "new_user" webhook (non-blocking)
    try {
      const zapierRouter = require('./zapier');
      zapierRouter.fireEvent('new_user', { id: user._id, name: user.name, email: user.email, tier: user.tier, createdAt: user.createdAt });
    } catch (_) {}

    const token = generateToken(user._id);
    const checkoutUrl = tier !== 'free' ? await stripeRoutes.createCheckoutUrlForUser(user, tier) : null;
    res.status(201).json({ token, user: publicUser(user), checkoutUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: generateToken(user._id), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(publicUser(req.user));
});

// POST /api/auth/logout
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
