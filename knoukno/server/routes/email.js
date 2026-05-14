const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const EmailLog = require('../models/EmailLog');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// POST /api/email/blast
router.post('/blast', protect, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ message: 'Subject and body required' });
    const users = await User.find({ isActive: true });
    const transporter = createTransporter();
    let sent = 0, failed = 0;
    for (const user of users) {
      try {
        await transporter.sendMail({ from: process.env.EMAIL_USER, to: user.email, subject, html: body });
        await EmailLog.create({ userId: user._id, type: 'blast', subject, body, status: 'sent' });
        sent++;
      } catch (e) {
        await EmailLog.create({ userId: user._id, type: 'blast', subject, body, status: 'failed' });
        failed++;
      }
    }
    res.json({ message: `Blast sent: ${sent} success, ${failed} failed` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/email/send/:userId
router.post('/send/:userId', protect, async (req, res) => {
  try {
    const { subject, body } = req.body;
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    const transporter = createTransporter();
    await transporter.sendMail({ from: process.env.EMAIL_USER, to: targetUser.email, subject, html: body });
    await EmailLog.create({ userId: targetUser._id, type: 'individual', subject, body, status: 'sent' });
    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    await EmailLog.create({ userId: req.params.userId, type: 'individual', subject: req.body.subject, body: req.body.body, status: 'failed' });
    res.status(500).json({ message: err.message });
  }
});

// GET /api/email/logs
router.get('/logs', protect, async (req, res) => {
  try {
    const logs = await EmailLog.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
