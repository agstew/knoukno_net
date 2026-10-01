const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const mailer = require('../utils/mailer');

const thankYouEmail = (name, position) => `Hi ${name},

Thank you for applying to Kno U Kno for the ${position} role. We've received your application and a member of our team will review it shortly.

If your background is a match, we'll reach out to schedule a conversation. We appreciate the time you took to apply and the interest you've shown in joining us.

Thank you,
Kno U Kno Hiring Team`;

// POST /api/hiring/apply - public
router.post('/apply', async (req, res) => {
  try {
    const { name, email, phone, position, message } = req.body;
    if (!name?.trim() || !email?.trim() || !position?.trim()) {
      return res.status(400).json({ message: 'Name, email, and position are required.' });
    }

    const application = await JobApplication.create({ name, email, phone, position, message });

    try {
      if (mailer.isConfigured()) {
        await mailer.sendMail({
          to: email,
          subject: `Thank You for Applying \u2014 ${position}`,
          text: thankYouEmail(name, position)
        });
      }
    } catch (mailErr) {
      console.error('Thank-you email failed:', mailErr.message);
    }

    res.status(201).json({ message: 'Application received. Thank you!', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
