const express = require('express');
const router = express.Router();
const stripeLib = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY ? stripeLib(process.env.STRIPE_SECRET_KEY) : null;
const Entitlement = require('../models/Entitlement');
const User = require('../models/User');

router.post('/create-checkout-session', async (req, res) => {
  const { tier } = req.body || {};

  // Tier configuration (amounts in cents)
  const TIERS = {
    free: { name: 'Free — 5 questions (3 days)', amount: 0, description: 'Free trial: 5 questions for 3 days' },
    members: { name: 'Members — 50 questions / Month', amount: 3900, description: 'Members monthly subscription (50 questions)' },
    pro: { name: 'Pro — 75 questions / Year', amount: 43600, description: 'Pro yearly subscription (75 questions)' },
    bonus: { name: 'Bonus — 100 questions', amount: 10000, description: 'One-time bonus pack: 100 questions' }
  };

  const config = TIERS[tier];
  if (!config) return res.status(400).json({ error: 'Unknown or unsupported tier' });

  // If tier is free, optionally create entitlement locally (3 day trial)
  if (tier === 'free') {
    try {
      const email = req.body && req.body.email ? String(req.body.email) : undefined;
      const userIdFromBody = req.body && req.body.userId ? req.body.userId : undefined;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      const ent = new Entitlement({ email, tier: 'free', amount: 0, expiresAt, meta: { trial: true } });
      if (userIdFromBody) {
        try { ent.userId = userIdFromBody; } catch (e) { /* ignore */ }
      }
      await ent.save();

      // If we have a user by email or userId, ensure user's entitlements are linked
      try {
        let user = null;
        if (userIdFromBody) user = await User.findById(userIdFromBody);
        if (!user && email) user = await User.findOne({ email });
        if (user) {
          await Entitlement.updateOne({ _id: ent._id }, { $set: { userId: user._id } });
          user.entitlements = user.entitlements || [];
          if (!user.entitlements.find(eid => String(eid) === String(ent._id))) user.entitlements.push(ent._id);
          await user.save();
        }
      } catch (linkErr) {
        console.warn('Failed to link free entitlement to user:', linkErr && linkErr.message ? linkErr.message : linkErr);
      }
      return res.json({ ok: true, message: 'Free trial granted: 5 questions for 3 days', tier: 'free', entitlementId: ent._id });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create entitlement: ' + err.message });
    }
  }

  if (!stripe) return res.status(501).json({ error: 'Stripe not configured' });

  // If environment price IDs are configured, use them
  const priceIds = {
    members: process.env.STRIPE_PRICE_MEMBERS || null,
    pro: process.env.STRIPE_PRICE_PRO || null,
    bonus: process.env.STRIPE_PRICE_BONUS || null
  };

  try {
    const bodyEmail = req.body && req.body.email ? String(req.body.email) : undefined;
    const userIdFromBody = req.body && req.body.userId ? req.body.userId : undefined;
    let checkoutCustomer = undefined;
    if (userIdFromBody) {
      try {
        const user = await User.findById(userIdFromBody);
        if (user && user.stripeCustomerId) checkoutCustomer = user.stripeCustomerId;
      } catch (e) { /* ignore */ }
    }
    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      metadata: { tier }
    };

    // prefer using a configured Price ID
    if (priceIds[tier]) {
      sessionParams.line_items = [{ price: priceIds[tier], quantity: 1 }];
      if (bodyEmail) sessionParams.customer_email = bodyEmail;
      if (checkoutCustomer) sessionParams.customer = checkoutCustomer;
    } else {
      sessionParams.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: { name: config.name, description: config.description },
          unit_amount: config.amount,
        }, quantity: 1
      }];
      if (bodyEmail) sessionParams.customer_email = bodyEmail;
      if (checkoutCustomer) sessionParams.customer = checkoutCustomer;
    }

    sessionParams.success_url = `${req.protocol}://${req.get('host')}/?session_id={CHECKOUT_SESSION_ID}`;
    sessionParams.cancel_url = `${req.protocol}://${req.get('host')}/?canceled=1`;

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url, id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve a checkout session by id (used by client after redirect)
router.get('/session', async (req, res) => {
  if (!stripe) return res.status(501).json({ error: 'Stripe not configured' });
  const sessionId = req.query.sessionId || req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({ session });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Webhook endpoint to receive events from Stripe (expects raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').toString().trim() || null;
  let event = null;

  try {
    if (webhookSecret && sig) {
      // If we have a webhook secret and a signature header, validate
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Fallback: if body is a Buffer, parse; if already parsed object, use it directly
      if (Buffer.isBuffer(req.body)) {
        event = JSON.parse(req.body.toString());
      } else {
        event = req.body;
      }
    }
  } catch (err) {
    console.warn('Webhook signature verification failed.', err && err.message ? err.message : err);
    return res.status(400).send(`Webhook Error: ${err && err.message ? err.message : String(err)}`);
  }

  // Handle the event types you care about
  switch (event.type) {
    case 'checkout.session.completed':
      try {
        const session = event.data.object;
        const tier = (session.metadata && session.metadata.tier) || undefined;
        const email = (session.customer_details && session.customer_details.email) || session.customer_email || undefined;
        const amount = session.amount_total || (session.display_items && session.display_items[0] && session.display_items[0].amount) || null;
        // create entitlement record
        const ent = new Entitlement({
          email,
          tier: tier || 'unknown',
          amount: amount || 0,
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent || session.payment_intent_id,
          meta: { session }
        });

        // set expiry rules for subscriptions
        const now = new Date();
        if (tier === 'members') ent.expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        else if (tier === 'pro') ent.expiresAt = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
        else if (tier === 'bonus') ent.expiresAt = null;

        await ent.save();

        // Link entitlement to a user if possible.
        try {
          let linkedUser = null;
          // Prefer lookup by Stripe customer id when available
          const customerId = session.customer || (session.customer_details && session.customer_details.customer) || undefined;
          if (customerId) {
            linkedUser = await User.findOne({ stripeCustomerId: customerId });
          }

          // Fallback to email lookup
          if (!linkedUser && email) linkedUser = await User.findOne({ email });

          if (linkedUser) {
            // If user has no stripeCustomerId but checkout created one, save it
            if (customerId && !linkedUser.stripeCustomerId) {
              try { linkedUser.stripeCustomerId = customerId; await linkedUser.save(); } catch (e) { /* ignore */ }
            }

            ent.userId = linkedUser._id;
            await ent.save();
            linkedUser.entitlements = linkedUser.entitlements || [];
            if (!linkedUser.entitlements.find(eid => String(eid) === String(ent._id))) linkedUser.entitlements.push(ent._id);
            await linkedUser.save();
          }
        } catch (linkErr) {
          console.warn('Failed to link entitlement to user from webhook:', linkErr && linkErr.message ? linkErr.message : linkErr);
        }

        console.log('Entitlement created for', email, 'tier', tier, 'id', ent._id.toString());
      } catch (err) {
        console.error('Failed to create entitlement from webhook:', err && err.message ? err.message : err);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
