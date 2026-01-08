const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailer = require('../utils/mailer');
const User = require('../models/User');
const validators = require('../middleware/validators');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-please';

router.get('/register', (req, res) => res.render('register'));
router.post('/register', validators.register, validators.check('register'), async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.render('register', { error: 'Email taken' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    // Default free tier: 5 questions, 3 days
    const tierExpires = new Date(Date.now() + 3*24*3600*1000);
    await User.create({ name, email, password: hash, tier: 'free', tierExpires, questionsRemaining: 5 });
    res.redirect('/auth/login');
  } catch (err) {
    res.render('register', { error: 'Server error' });
  }
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', validators.login, validators.check('login'), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render('login', { error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.render('login', { error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const cookieOpts = {
    httpOnly: true,
    maxAge: 7 * 24 * 3600 * 1000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };
  res.cookie('token', token, cookieOpts);
  res.redirect('/questions');
});

router.get('/forgot', (req, res) => res.render('forgot'));
router.post('/forgot', validators.forgot, validators.check('forgot'), async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render('forgot', { message: 'If that email exists, a reset link will be sent.' });
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset/${token}`;
  try {
    await mailer.sendMail({
      to: email,
      subject: 'Kno U Kno — Password reset',
      text: `Click to reset your password: ${resetLink}`,
      html: `<p>Click to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
    });
    res.render('forgot', { message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    // fallback: show token for testing
    res.render('forgot', { message: 'Error sending email — token below for testing', token });
  }
});

router.get('/reset/:token', (req, res) => {
  const { token } = req.params;
  try{
    jwt.verify(token, JWT_SECRET);
    res.render('reset', { token });
  }catch(e){
    res.render('reset', { error: 'Invalid or expired token' });
  }
});

router.post('/reset/:token', validators.reset, (req, res, next) => validators.check('reset')(req, res, next), async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.render('reset', { error: 'User not found' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.render('login', { message: 'Password reset. Please login.' });
  }catch(e){
    res.render('reset', { error: 'Invalid or expired token' });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Return current user info (if logged in via cookie)
router.get('/me', async (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.json({ user: null });
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(payload.id).select('-password');
    return res.json({ user });
  }catch(e){
    return res.json({ user: null });
  }
});

module.exports = router;
