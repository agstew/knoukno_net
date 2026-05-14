const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

let stripe;
try { stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); } catch (e) {}

const tierPrices = {
  member: process.env.STRIPE_MEMBER_PRICE_ID || 'price_member',
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
  bonus: process.env.STRIPE_BONUS_PRICE_ID || 'price_bonus'
};

async function createCheckoutUrlForUser(user, tier) {
  if (!['member', 'pro', 'bonus'].includes(tier)) return null;
  if (!stripe || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('...')) return null;

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name });
    customerId = customer.id;
    await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: tier === 'bonus' ? 'payment' : 'subscription',
    line_items: [{ price: tierPrices[tier], quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.CLIENT_URL}/price?upgrade=cancelled`,
    metadata: { userId: user._id.toString(), tier }
  });
  return session.url;
}

// POST /api/stripe/create-checkout
router.post('/create-checkout', protect, async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['member', 'pro', 'bonus'].includes(tier)) return res.status(400).json({ message: 'Invalid tier' });
    const url = await createCheckoutUrlForUser(req.user, tier);
    if (!url) return res.status(500).json({ message: 'Stripe not configured' });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/stripe/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(500).json({ message: 'Stripe not configured' });
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, tier } = session.metadata;
    await User.findByIdAndUpdate(userId, {
      tier,
      pendingTier: tier,
      stripeSubscriptionId: session.subscription,
      subscriptionStatus: 'active'
    });
  }
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    await User.findOneAndUpdate({ stripeSubscriptionId: sub.id }, { tier: 'free', stripeSubscriptionId: null });
  }
  res.json({ received: true });
});

router.createCheckoutUrlForUser = createCheckoutUrlForUser;
module.exports = router;
