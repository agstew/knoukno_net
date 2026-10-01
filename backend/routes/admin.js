const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Business = require('../models/Business');
const UserBusiness = require('../models/UserBusiness');
const AdminMessage = require('../models/AdminMessage');
const ScheduledEmail = require('../models/ScheduledEmail');
const JobApplication = require('../models/JobApplication');
const mailer = require('../utils/mailer');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/plan
router.put('/users/:id/plan', async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['free', 'members', 'pro'].includes(tier)) return res.status(400).json({ message: 'Invalid plan' });
    // Setting free restarts a 3-day trial; paid plans don't expire
    const tierExpiry = tier === 'free' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null;
    const user = await User.findByIdAndUpdate(req.params.id, { tier, tierExpiry }, { new: true })
      .select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/bonus
router.put('/users/:id/bonus', async (req, res) => {
  try {
    const bonusQuestions = Number(req.body.bonusQuestions);
    if (!Number.isFinite(bonusQuestions) || bonusQuestions < 0) {
      return res.status(400).json({ message: 'Bonus questions must be a non-negative number.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { bonusQuestions }, { new: true })
      .select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id/messages
router.get('/users/:id/messages', async (req, res) => {
  try {
    const messages = await AdminMessage.find({ userId: req.params.id }).sort({ sentAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users/:id/messages
router.post('/users/:id/messages', async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let status = 'sent';
    let error;
    try {
      if (!mailer.isConfigured()) throw new Error('Email is not configured on the server.');
      await mailer.sendMail({ to: user.email, subject, text: message });
    } catch (sendErr) {
      status = 'failed';
      error = sendErr.message;
    }

    const record = await AdminMessage.create({ userId: user._id, toEmail: user.email, subject, message, status, error });

    if (status === 'failed') return res.status(502).json({ message: error, record });
    res.status(201).json({ message: 'Email sent', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users/broadcast
router.post('/users/broadcast', async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }
    if (!mailer.isConfigured()) {
      return res.status(502).json({ message: 'Email is not configured on the server.' });
    }

    const users = await User.find({ emailOptOut: { $ne: true } }).select('_id email');
    let sent = 0;
    let failed = 0;

    for (const user of users) {
      let status = 'sent';
      let error;
      try {
        await mailer.sendMail({ to: user.email, subject, text: message });
        sent += 1;
      } catch (sendErr) {
        status = 'failed';
        error = sendErr.message;
        failed += 1;
      }
      await AdminMessage.create({ userId: user._id, toEmail: user.email, subject, message, status, error });
    }

    res.status(201).json({ message: `Sent to ${sent} of ${users.length} users.`, sent, failed, total: users.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/scheduled-emails
router.get('/scheduled-emails', async (req, res) => {
  try {
    const [pending, history, pendingCount] = await Promise.all([
      ScheduledEmail.find({ status: 'pending' }).sort({ sendAt: 1 }).limit(10),
      ScheduledEmail.find({ status: { $ne: 'pending' } }).sort({ processedAt: -1 }).limit(10),
      ScheduledEmail.countDocuments({ status: 'pending' })
    ]);
    res.json({ scheduledEmails: [...pending, ...history], pendingCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/scheduled-emails
router.post('/scheduled-emails', async (req, res) => {
  try {
    const { subject, message, sendAt } = req.body;
    if (!subject?.trim() || !message?.trim() || !sendAt) {
      return res.status(400).json({ message: 'Subject, message, and send time are required.' });
    }
    const sendDate = new Date(sendAt);
    if (Number.isNaN(sendDate.getTime()) || sendDate <= new Date()) {
      return res.status(400).json({ message: 'Send time must be in the future.' });
    }
    const scheduledEmail = await ScheduledEmail.create({ subject, message, sendAt: sendDate });
    res.status(201).json({ message: 'Email scheduled.', scheduledEmail });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/scheduled-emails/:id
router.delete('/scheduled-emails/:id', async (req, res) => {
  try {
    const scheduledEmail = await ScheduledEmail.findById(req.params.id);
    if (!scheduledEmail) return res.status(404).json({ message: 'Not found' });
    if (scheduledEmail.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending scheduled emails can be cancelled.' });
    }
    scheduledEmail.status = 'cancelled';
    await scheduledEmail.save();
    res.json({ message: 'Scheduled email cancelled.', scheduledEmail });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be deleted.' });
    }

    await Promise.all([
      Answer.deleteMany({ userId: user._id }),
      UserBusiness.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id)
    ]);

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/answers
router.get('/answers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = await Answer.countDocuments();
    const answers = await Answer.find()
      .populate('userId', 'name email tier')
      .populate('questionId', 'businessTitle questionText category')
      .sort({ savedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ answers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/questions
router.get('/questions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    // Group by questionNumber so each number appears once (the bank is duplicated per businessTitle).
    const grouped = await Question.aggregate([
      { $sort: { questionNumber: 1, createdAt: 1 } },
      { $group: { _id: '$questionNumber', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { questionNumber: 1 } },
      {
        $facet: {
          questions: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);
    const questions = grouped[0]?.questions || [];
    const total = grouped[0]?.totalCount?.[0]?.count || 0;
    res.json({ questions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/questions
router.post('/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/questions/:id
router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/titles/:title
router.delete('/titles/:title', async (req, res) => {
  try {
    const businessTitle = decodeURIComponent(req.params.title || '').trim();
    if (!businessTitle) {
      return res.status(400).json({ message: 'Business title is required.' });
    }

    const [questionResult, businessResult] = await Promise.all([
      Question.updateMany(
        { businessTitle, isActive: true },
        { $set: { isActive: false } }
      ),
      Business.updateMany(
        { title: businessTitle, isActive: true },
        { $set: { isActive: false } }
      )
    ]);

    if (questionResult.matchedCount === 0 && businessResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Business title not found.' });
    }

    res.json({
      message: 'Business title deleted.',
      title: businessTitle,
      deactivatedQuestions: questionResult.modifiedCount,
      deactivatedBusinesses: businessResult.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
 });

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const distinctNumbers = await Question.distinct('questionNumber', { isActive: true });
    const totalQuestions = distinctNumbers.length;
    const freeUsers = await User.countDocuments({ tier: 'free' });
    const membersUsers = await User.countDocuments({ tier: 'members' });
    const proUsers = await User.countDocuments({ tier: 'pro' });
    res.json({ totalUsers, totalAnswers, totalQuestions, byTier: { free: freeUsers, members: membersUsers, pro: proUsers } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/applications
router.get('/applications', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = await JobApplication.countDocuments();
    const applications = await JobApplication.find()
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ applications, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/applications/:id/status
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'reviewed', 'contacted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const application = await JobApplication.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
