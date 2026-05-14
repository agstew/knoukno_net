require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { message: 'Too many requests, please try again later' } }));

// Body parser - must be before routes (stripe webhook needs raw body)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Zapier webhook registry
const zapierRouter = require('./routes/zapier');
app.use('/api/zapier/hooks', zapierRouter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/questions'));  // handles /api/questions and /api/titles
app.use('/api', require('./routes/grades'));      // handles /api/answers, /api/grades, /api/rates
app.use('/api/email', require('./routes/email'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Daily email cron job - runs at 8am every day
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily email job...');
  try {
    const User = require('./models/User');
    const EmailLog = require('./models/EmailLog');
    const daily365 = require('./emails/daily365');

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const users = await User.find({ isActive: true });
    for (const user of users) {
      const emailIndex = user.dailyEmailIndex % 365;
      const emailContent = daily365[emailIndex];
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.body
        });
        await EmailLog.create({ userId: user._id, type: 'daily', subject: emailContent.subject, body: emailContent.body, status: 'sent', dayIndex: emailIndex });
        await User.findByIdAndUpdate(user._id, { dailyEmailIndex: emailIndex + 1, lastEmailSent: new Date() });
      } catch (e) {
        console.error(`Failed to send daily email to ${user.email}:`, e.message);
        await EmailLog.create({ userId: user._id, type: 'daily', subject: emailContent.subject, status: 'failed', dayIndex: emailIndex });
      }
    }
    console.log(`Daily emails sent to ${users.length} users`);
  } catch (err) {
    console.error('Daily email cron error:', err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
