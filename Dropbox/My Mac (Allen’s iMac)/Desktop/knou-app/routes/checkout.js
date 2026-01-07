const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Tier = require('../models/Tier');

const stripeSecret = process.env.STRIPE_SECRET;
const stripe = stripeSecret ? Stripe(stripeSecret) : null;

router.post('/create-session', async (req, res) => {
  try {
    const { tierId } = req.body;
    if (!tierId) return res.status(400).json({ error: 'tierId required' });

    const tier = await Tier.findById(tierId);
    if (!tier) return res.status(404).json({ error: 'Tier not found' });

    const amount = Math.round((tier.price || 0) * 100);

    if (!stripe) {
      // Fallback for local/dev without Stripe configured
      return res.json({ url: `/success?mock=true&tier=${encodeURIComponent(tier.name)}` });
    }

    let sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/success',
      cancel_url: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/cancel',
      line_items: []
    };

    // If a Stripe Price ID is configured for this tier, use it
    if (tier.stripePriceId) {
      // Assume subscription if durationDays looks recurring (>=30)
      const recurring = tier.durationDays && tier.durationDays >= 30;
      sessionParams.mode = recurring ? 'subscription' : 'payment';
      sessionParams.line_items.push({ price: tier.stripePriceId, quantity: 1 });
    } else {
      // Build inline price data
      const recurring = tier.durationDays && tier.durationDays >= 30;
      const priceData = {
        currency: 'usd',
        unit_amount: amount,
        product_data: { name: tier.name }
      };
      if (recurring) priceData.recurring = { interval: tier.durationDays >= 365 ? 'year' : 'month' };
      sessionParams.mode = recurring ? 'subscription' : 'payment';
      sessionParams.line_items.push({ price_data: priceData, quantity: 1 });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout create-session error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
