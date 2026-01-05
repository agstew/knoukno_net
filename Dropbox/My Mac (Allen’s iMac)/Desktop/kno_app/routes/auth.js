const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Entitlement = require('../models/Entitlement');
const mongoose = require('mongoose');
const mailer = require('../utils/mailer');
const templates = require('../utils/emailTemplates');

const router = express.Router();

// Forgot password - generate token and log reset link (no email service configured)
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: true, message: 'If that email exists, a reset link was generated.' });
    const token = uuidv4();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600 * 1000; // 1 hour
    await user.save();
    const link = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
    // Determine locale from Accept-Language header or app default
    const accept = (req.get('accept-language') || '').split(',')[0] || process.env.APP_LOCALE || 'en';
    // Use templated email if available; try to send, fallback to console log
    const { subject, text, html } = templates.resetPasswordTemplate({ link, appName: process.env.APP_NAME || 'Kno U Kno', locale: accept });
    try {
      await mailer.sendMail({ to: email, subject, text, html });
      res.json({ ok: true, message: 'If that email exists, a reset link was sent.' });
    } catch (err) {
      console.warn('Mail send failed, falling back to console log:', err.message);
      console.log('Password reset link for', email, ':', link);
      res.json({ ok: true, message: 'If that email exists, a reset link was generated (check server logs).' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password using token
router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hash });
    await user.save();

    // Link any pre-existing entitlements that were created for this email
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const existingEnts = await Entitlement.find({ email: user.email, userId: { $exists: false } });
        if (existingEnts && existingEnts.length) {
          const entIds = existingEnts.map(e => e._id);
          // set userId on entitlements
          await Entitlement.updateMany({ _id: { $in: entIds } }, { $set: { userId: user._id } });
          // add to user's entitlements array
          user.entitlements = (user.entitlements || []).concat(entIds);
          await user.save();
          console.log(`Linked ${entIds.length} entitlement(s) to new user ${user.email}`);
        }
      } else {
        // mongoose not connected (unit tests or mocked env) - skip linking
      }
    } catch (linkErr) {
      console.warn('Failed to link entitlements on registration:', linkErr && linkErr.message ? linkErr.message : linkErr);
    }

    const token = jwt.sign({ id: user._id, uuid: uuidv4() }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

