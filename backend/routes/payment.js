const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// One-time add-on. Members/Pro below are real recurring PayPal subscriptions.
const BONUS_PRICE = { id: 'bonus', name: 'Bonus Questions', price: 10000, display: '$100.00', questions: 100 };

const PLANS = [
  {
    id: 'members',
    name: 'Members',
    display: '$39.00',
    original: '$49.00',
    discount: '20% off',
    questions: 50,
    billingPeriod: 'month',
    envPlanId: 'PAYPAL_PLAN_MEMBERS'
  },
  {
    id: 'pro',
    name: 'Pro',
    display: '$436.00',
    original: '$675.00',
    discount: '35% off',
    questions: 75,
    billingPeriod: 'year',
    envPlanId: 'PAYPAL_PLAN_PRO'
  }
];
const TIER_RANK = { free: 0, members: 1, pro: 2 };

const paypalConfigured = () => Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
const subscriptionsConfigured = () =>
  paypalConfigured() && Boolean(process.env.PAYPAL_PLAN_MEMBERS && process.env.PAYPAL_PLAN_PRO);
const paypalBase = () =>
  process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const toDollars = (cents) => (cents / 100).toFixed(2);

const paypalToken = async () => {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  return (await res.json()).access_token;
};

const paypal = async (path, options = {}) => {
  const res = await fetch(`${paypalBase()}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${await paypalToken()}`, 'Content-Type': 'application/json', ...options.headers }
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
};

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:3000';
const publicPlan = ({ envPlanId, ...rest }) => rest;

// GET /api/payment/prices
router.get('/prices', (req, res) => {
  const members = PLANS.find((p) => p.id === 'members');
  const pro = PLANS.find((p) => p.id === 'pro');
  res.json([
    { ...publicPlan(members), checkoutAvailable: subscriptionsConfigured() },
    { ...publicPlan(pro), checkoutAvailable: subscriptionsConfigured() },
    { ...BONUS_PRICE, checkoutAvailable: paypalConfigured() }
  ]);
});

// POST /api/payment/create-subscription  { tier: 'members' | 'pro' }
router.post('/create-subscription', protect, async (req, res) => {
  if (!subscriptionsConfigured()) return res.status(503).json({ message: 'Checkout is not configured yet.' });
  try {
    const plan = PLANS.find((p) => p.id === req.body.tier);
    if (!plan) return res.status(400).json({ message: 'Invalid plan' });
    if (TIER_RANK[req.user.tier] >= TIER_RANK[plan.id] && req.user.subscriptionStatus === 'active') {
      return res.status(400).json({ message: `You already have the ${req.user.tier} plan.` });
    }

    const planId = process.env[plan.envPlanId];
    const { ok, data } = await paypal('/v1/billing/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        custom_id: req.user.id,
        application_context: {
          brand_name: 'Kno U Kno',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${clientUrl()}/price?paypal=subscribe-return`,
          cancel_url: `${clientUrl()}/price?payment=cancelled`
        }
      })
    });
    const approve = ok && data.links?.find((l) => l.rel === 'approve');
    if (!approve) {
      console.error('PayPal create subscription failed:', data.name || data);
      return res.status(502).json({ message: 'Could not start PayPal checkout. Please try again.' });
    }
    res.json({ url: approve.href });
  } catch (err) {
    console.error('PayPal subscription error:', err.message);
    res.status(500).json({ message: 'Payment error. Please try again.' });
  }
});

// POST /api/payment/activate-subscription  { subscriptionId }
router.post('/activate-subscription', protect, async (req, res) => {
  if (!subscriptionsConfigured()) return res.status(503).json({ message: 'Checkout is not configured yet.' });
  try {
    const { subscriptionId } = req.body;
    if (typeof subscriptionId !== 'string' || !/^I-[A-Z0-9]{5,30}$/.test(subscriptionId)) {
      return res.status(400).json({ message: 'Invalid subscription.' });
    }

    const { ok, data: sub } = await paypal(`/v1/billing/subscriptions/${subscriptionId}`);
    if (!ok) return res.status(400).json({ message: 'Could not verify this subscription.' });
    if (sub.custom_id !== req.user.id) {
      return res.status(403).json({ message: 'This subscription does not belong to your account.' });
    }
    if (sub.status !== 'ACTIVE') {
      return res.status(400).json({ message: `Subscription is ${sub.status.toLowerCase()}, not active yet.` });
    }

    const plan = PLANS.find((p) => (process.env[p.envPlanId] || '') === sub.plan_id);
    if (!plan) return res.status(400).json({ message: 'Unrecognized plan.' });

    await User.findByIdAndUpdate(req.user.id, {
      tier: plan.id,
      tierExpiry: sub.billing_info?.next_billing_time ? new Date(sub.billing_info.next_billing_time) : null,
      subscriptionId,
      subscriptionStatus: 'active'
    });
    res.json({ message: 'Subscription active. Your plan has been upgraded.', tier: plan.id });
  } catch (err) {
    console.error('PayPal activate error:', err.message);
    res.status(500).json({ message: 'Payment error. Please contact support.' });
  }
});

// POST /api/payment/cancel-subscription
router.post('/cancel-subscription', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.subscriptionId || user.subscriptionStatus !== 'active') {
      return res.status(400).json({ message: 'No active subscription to cancel.' });
    }
    const { ok, status } = await paypal(`/v1/billing/subscriptions/${user.subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Cancelled by customer from account settings.' })
    });
    if (!ok && status !== 404) {
      return res.status(502).json({ message: 'Could not cancel with PayPal. Please try again.' });
    }
    user.subscriptionStatus = 'cancelled';
    await user.save();
    const until = user.tierExpiry ? new Date(user.tierExpiry).toLocaleDateString() : 'the end of your current period';
    res.json({ message: `Your subscription was cancelled. You'll keep access until ${until}.` });
  } catch (err) {
    console.error('PayPal cancel error:', err.message);
    res.status(500).json({ message: 'Could not cancel your subscription. Please contact support.' });
  }
});

// POST /api/payment/create-order  (Bonus questions only - one-time purchase)
router.post('/create-order', protect, async (req, res) => {
  if (!paypalConfigured()) return res.status(503).json({ message: 'Checkout is not configured yet.' });
  try {
    if (req.body.tier !== 'bonus') {
      return res.status(400).json({ message: 'Members and Pro are subscriptions - use /create-subscription.' });
    }
    if (req.user.tier === 'free') {
      return res.status(400).json({ message: 'Bonus questions are an add-on for Members and Pro.' });
    }

    const { ok, data } = await paypal('/v2/checkout/orders', {
      method: 'POST',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: 'USD', value: toDollars(BONUS_PRICE.price) },
            description: `Kno U Kno - ${BONUS_PRICE.name}`,
            custom_id: `${req.user.id}:bonus`
          }
        ],
        application_context: {
          brand_name: 'Kno U Kno',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: `${clientUrl()}/price?paypal=return`,
          cancel_url: `${clientUrl()}/price?payment=cancelled`
        }
      })
    });
    const approve = ok && data.links?.find((l) => l.rel === 'approve');
    if (!approve) {
      console.error('PayPal create order failed:', data.name || data);
      return res.status(502).json({ message: 'Could not start PayPal checkout. Please try again.' });
    }
    res.json({ url: approve.href });
  } catch (err) {
    console.error('PayPal error:', err.message);
    res.status(500).json({ message: 'Payment error. Please try again.' });
  }
});

// POST /api/payment/capture  (Bonus questions only)
router.post('/capture', protect, async (req, res) => {
  if (!paypalConfigured()) return res.status(503).json({ message: 'Checkout is not configured yet.' });
  try {
    const { orderId } = req.body;
    if (typeof orderId !== 'string' || !/^[A-Z0-9]{5,40}$/.test(orderId)) {
      return res.status(400).json({ message: 'Invalid order.' });
    }

    const { ok, data } = await paypal(`/v2/checkout/orders/${orderId}/capture`, { method: 'POST' });
    if (!ok || data.status !== 'COMPLETED') {
      console.error('PayPal capture failed:', data.name || data.status);
      return res.status(400).json({ message: 'Payment was not completed.' });
    }

    const unit = data.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const [userId, tier] = String(capture?.custom_id || unit?.custom_id || '').split(':');
    if (userId !== req.user.id || tier !== 'bonus') {
      return res.status(403).json({ message: 'This payment does not belong to your account.' });
    }
    if (capture?.status !== 'COMPLETED' || capture.amount?.currency_code !== 'USD' || capture.amount?.value !== toDollars(BONUS_PRICE.price)) {
      console.error('PayPal capture mismatch for order', orderId);
      return res.status(400).json({ message: 'Payment amount did not match. Please contact support.' });
    }

    await User.findByIdAndUpdate(req.user.id, { $inc: { bonusQuestions: BONUS_PRICE.questions } });
    res.json({ message: 'Payment complete. Your plan has been upgraded.', tier: 'bonus' });
  } catch (err) {
    console.error('PayPal capture error:', err.message);
    res.status(500).json({ message: 'Payment error. Please contact support.' });
  }
});

// POST /api/payment/webhook  (PayPal server-to-server event notifications)
router.post('/webhook', async (req, res) => {
  try {
    if (!process.env.PAYPAL_WEBHOOK_ID) return res.status(503).end();

    const { ok, data: verification } = await paypal('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: JSON.stringify({
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: req.body
      })
    });
    if (!ok || verification.verification_status !== 'SUCCESS') {
      console.error('Rejected unverifiable PayPal webhook event');
      return res.status(400).end();
    }

    const event = req.body;
    const resource = event.resource || {};

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const plan = PLANS.find((p) => (process.env[p.envPlanId] || '') === resource.plan_id);
        if (plan && resource.custom_id) {
          await User.findByIdAndUpdate(resource.custom_id, {
            tier: plan.id,
            tierExpiry: resource.billing_info?.next_billing_time ? new Date(resource.billing_info.next_billing_time) : null,
            subscriptionId: resource.id,
            subscriptionStatus: 'active'
          });
        }
        break;
      }
      case 'PAYMENT.SALE.COMPLETED': {
        const subId = resource.billing_agreement_id;
        if (subId) {
          const { ok: subOk, data: sub } = await paypal(`/v1/billing/subscriptions/${subId}`);
          if (subOk && sub.custom_id) {
            const plan = PLANS.find((p) => (process.env[p.envPlanId] || '') === sub.plan_id);
            if (plan) {
              await User.findByIdAndUpdate(sub.custom_id, {
                tier: plan.id,
                tierExpiry: sub.billing_info?.next_billing_time ? new Date(sub.billing_info.next_billing_time) : null,
                subscriptionId: subId,
                subscriptionStatus: 'active'
              });
            }
          }
        }
        break;
      }
      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const user = await User.findOne({ subscriptionId: resource.id });
        if (user && user.subscriptionStatus !== 'cancelled') {
          user.subscriptionStatus = 'cancelled';
          await user.save();
        }
        break;
      }
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        await User.findOneAndUpdate({ subscriptionId: resource.id }, { tier: 'free', subscriptionStatus: 'expired' });
        break;
      }
      default:
        break;
    }

    res.status(200).end();
  } catch (err) {
    console.error('PayPal webhook error:', err.message);
    res.status(500).end();
  }
});

module.exports = router;
