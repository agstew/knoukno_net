const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const requireAuth = require('../middleware/auth');
const User = require('../models/User');

router.post('/create-checkout-session', requireAuth, async (req, res) => {
  const { tier } = req.body;
  let amount;
  let name;
  // Prices (in cents) per user spec. All operations require registration.
  // Members: $49.00 -> discounted $39.00 (we charge discounted amount here)
  // Pro: $675.00 -> discounted $436.00 (we charge discounted amount here)
  // Bonus: $100.00
  if (tier === 'members') { amount = 3900; name = 'Members Tier — 175 questions'; }
  else if (tier === 'pro') { amount = 43600; name = 'Pro Tier — 75 questions / Year'; }
  else if (tier === 'bonus') { amount = 10000; name = 'Bonus 100 questions'; }
  else if (tier === 'free') {
    // Free trial: no Stripe session. Grant short free tier to user and redirect to success.
    try {
      if (req.user && req.user.id) {
        const user = await User.findById(req.user.id);
        if (user) {
          const now = new Date();
          user.tier = 'free';
          user.tierExpires = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
          user.questionsRemaining = 5;
          await user.save();
        }
      }
      // If this was an XHR/JSON request, return JSON with a redirect URL; otherwise perform a redirect.
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.json({ url: '/payments/success' });
      }
      return res.redirect('/payments/success');
    } catch (err) {
      console.error('Error granting free tier', err);
      return res.status(500).json({ error: 'Unable to grant free tier' });
    }
  }
  else return res.status(400).json({ error: 'Invalid tier', allowed: ['free','members','pro','bonus'] });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/success?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel?tier=${tier}`,
      metadata: { userId: req.user.id, tier }
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe create session error', err);
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
});

router.get('/success', requireAuth, (req, res) => {
  res.render('payment-success');
});

router.get('/cancel', requireAuth, (req, res) => {
  res.render('payment-cancel');
});

module.exports = router;
