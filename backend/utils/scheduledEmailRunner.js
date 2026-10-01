const crypto = require('crypto');
const User = require('../models/User');
const AdminMessage = require('../models/AdminMessage');
const ScheduledEmail = require('../models/ScheduledEmail');
const mailer = require('./mailer');

const BASE_URL = process.env.PUBLIC_URL || 'https://www.knoukno.online';

async function ensurePrefToken(user) {
  if (user.emailPrefToken) return user.emailPrefToken;
  user.emailPrefToken = crypto.randomBytes(24).toString('hex');
  await User.updateOne({ _id: user._id }, { emailPrefToken: user.emailPrefToken });
  return user.emailPrefToken;
}

function personalize(message, token) {
  return message
    .replace(/\{\{OPTOUT_LINK\}\}/g, `${BASE_URL}/api/email-preferences/${token}/optout`)
    .replace(/\{\{OPTIN_LINK\}\}/g, `${BASE_URL}/api/email-preferences/${token}/optin`);
}

// Finds due, pending scheduled emails and sends each to every subscribed user.
async function processDueScheduledEmails() {
  const due = await ScheduledEmail.find({ status: 'pending', sendAt: { $lte: new Date() } });
  if (due.length === 0) return;

  for (const scheduled of due) {
    try {
      if (!mailer.isConfigured()) throw new Error('Email is not configured on the server.');
      const users = await User.find({ emailOptOut: { $ne: true } }).select('_id email emailPrefToken');
      let sent = 0;
      let failed = 0;

      for (const user of users) {
        let status = 'sent';
        let error;
        try {
          const token = await ensurePrefToken(user);
          const personalizedMessage = personalize(scheduled.message, token);
          await mailer.sendMail({ to: user.email, subject: scheduled.subject, text: personalizedMessage });
          sent += 1;
        } catch (sendErr) {
          status = 'failed';
          error = sendErr.message;
          failed += 1;
        }
        await AdminMessage.create({ userId: user._id, toEmail: user.email, subject: scheduled.subject, message: scheduled.message, status, error });
      }

      scheduled.status = 'sent';
      scheduled.totalRecipients = users.length;
      scheduled.sentCount = sent;
      scheduled.failedCount = failed;
      scheduled.processedAt = new Date();
      await scheduled.save();
    } catch (err) {
      scheduled.status = 'failed';
      scheduled.error = err.message;
      scheduled.processedAt = new Date();
      await scheduled.save();
    }
  }
}

module.exports = { processDueScheduledEmails };
