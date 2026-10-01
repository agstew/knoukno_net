const express = require('express');
const router = express.Router();
const User = require('../models/User');

const page = (title, message) => `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:4rem auto;padding:0 1.5rem;text-align:center;color:#222}</style>
</head><body><h2>${title}</h2><p>${message}</p></body></html>`;

// GET /api/email-preferences/:token/optout - public, link from email footer
router.get('/:token/optout', async (req, res) => {
  const user = await User.findOneAndUpdate({ emailPrefToken: req.params.token }, { emailOptOut: true });
  if (!user) return res.status(404).send(page('Link not found', 'This email preference link is no longer valid.'));
  res.send(page('You have been unsubscribed', 'You will no longer receive the daily business email series. You can opt back in any time using the link in a previous email.'));
});

// GET /api/email-preferences/:token/optin - public, link from email footer
router.get('/:token/optin', async (req, res) => {
  const user = await User.findOneAndUpdate({ emailPrefToken: req.params.token }, { emailOptOut: false });
  if (!user) return res.status(404).send(page('Link not found', 'This email preference link is no longer valid.'));
  res.send(page('You are subscribed', 'You will continue to receive the daily business email series.'));
});

module.exports = router;
