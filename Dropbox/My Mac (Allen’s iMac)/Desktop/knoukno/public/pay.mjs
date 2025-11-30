import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const PORT = process.env.PORT || 5001;
const siteBase = (req) => process.env.SITE_BASE || req.headers.origin || `http://127.0.0.1:${PORT}`;
const successUrl = (req) => `${siteBase(req)}/pay/success?session_id={CHECKOUT_SESSION_ID}`;
const cancelUrl  = (req) => `${siteBase(req)}/pay/cancel`;

async function ensureCoupon(percent, { months = null } = {}) {
  if (!stripe) return null;
  const params = { percent_off: percent, duration: months ? 'repeating' : 'once' };
  if (months) params.duration_in_months = months;
  return stripe.coupons.create(params);
}

function readPromo(promo) {
  if (!promo || typeof promo !== 'object') return null;
  const pct = Number(promo.percent);
  if (!Number.isFinite(pct) || pct <= 0 || pct > 100) return null;
  const out = { percent: pct };
  if (promo.months) out.months = Math.max(1, Math.min(36, Number(promo.months)));
  if (promo.annual) out.annual = true;
  return out;
}

async function createCheckout({ plan, billing, promo }, req) {
  if (!stripe) {
    return `${siteBase(req)}/paidme/simulated.html?plan=${encodeURIComponent(plan)}${billing ? `&billing=${billing}` : ''}`;
  }

  const PRICE_STARTER = process.env.STRIPE_PRICE_STARTER || null;
  const PRICE_MEMBER  = process.env.STRIPE_PRICE_MEMBER  || null;
  const PRICE_ANNUAL  = process.env.STRIPE_PRICE_MEMBER_ANNUAL || null;

  const common = {
    success_url: successUrl(req),
    cancel_url: cancelUrl(req),
    automatic_tax: { enabled: true },
  };

  if (plan === 'starter') {
    let discounts = [];
    if (promo?.percent) {
      const coupon = await ensureCoupon(promo.percent);
      if (coupon) discounts = [{ coupon: coupon.id }];
    }

    if (PRICE_STARTER) {
      const s = await stripe.checkout.sessions.create({
        ...common, mode: 'payment',
        line_items: [{ price: PRICE_STARTER, quantity: 1 }],
        discounts,
      });
      return s.url;
    } else {
      const baseCents = 4900;
      const cents = Math.round(baseCents * (promo?.percent ? (1 - promo.percent / 100) : 1));
      const s = await stripe.checkout.sessions.create({
        ...common, mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Kno U Kno — Starter (One-time)' },
            unit_amount: cents,
          }, quantity: 1
        }],
      });
      return s.url;
    }
  }

  const bill = billing === 'annual' ? 'annual' : 'monthly';

  if (bill === 'monthly') {
    let subscription_data = undefined;
    if (promo?.percent) {
      const coupon = await ensureCoupon(promo.percent, { months: promo.months ?? 12 });
      if (coupon) subscription_data = { discounts: [{ coupon: coupon.id }] };
    }

    if (PRICE_MEMBER) {
      const s = await stripe.checkout.sessions.create({
        ...common, mode: 'subscription',
        line_items: [{ price: PRICE_MEMBER, quantity: 1 }],
        subscription_data,
      });
      return s.url;
    } else {
      const s = await stripe.checkout.sessions.create({
        ...common, mode: 'subscription',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Kno U Kno — Member (Monthly)' },
            recurring: { interval: 'month' },
            unit_amount: 1900,
          }, quantity: 1
        }],
        subscription_data,
      });
      return s.url;
    }
  } else {
    if (PRICE_ANNUAL) {
      let subscription_data = undefined;
      if (promo?.percent) {
        const coupon = await ensureCoupon(promo.percent);
        if (coupon) subscription_data = { discounts: [{ coupon: coupon.id }] };
      }
      const s = await stripe.checkout.sessions.create({
        ...common, mode: 'subscription',
        line_items: [{ price: PRICE_ANNUAL, quantity: 1 }],
        subscription_data,
      });
      return s.url;
    } else {
      const annualBaseCents = 19 * 12 * 100;
      const cents = Math.round(annualBaseCents * (promo?.percent ? (1 - promo.percent / 100) : 1));
      const s = await stripe.checkout.sessions.create({
        ...common, mode: 'subscription',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Kno U Kno — Member (Annual)' },
            recurring: { interval: 'year' },
            unit_amount: cents,
          }, quantity: 1
        }],
      });
      return s.url;
    }
  }
}

router.post('/checkout', async (req, res) => {
  try {
    const plan = req.body?.plan;
    const billing = req.body?.billing;
    const promo = readPromo(req.body?.promo);
    if (!['starter', 'member'].includes(plan)) {
      return res.status(400).json({ error: 'bad_request', message: 'plan must be "starter" or "member"' });
    }
    const url = await createCheckout({ plan, billing, promo }, req);
    return res.json({ url });
  } catch (err) {
    console.error('[pay/checkout]', err);
    return res.status(500).json({ error: 'internal_error', message: err.message });
  }
});

router.post('/start', async (req, res) => {
  try {
    const url = await createCheckout({ plan: 'starter', promo: readPromo(req.body?.promo) }, req);
    res.json({ url });
  } catch (e) {
    console.error('[pay/start]', e);
    res.status(500).json({ error: 'internal_error', message: e.message });
  }
});

router.post('/subscribe', async (req, res) => {
  try {
    const url = await createCheckout({ plan: 'member', billing: 'monthly', promo: readPromo(req.body?.promo) }, req);
    res.json({ url });
  } catch (e) {
    console.error('[pay/subscribe]', e);
    res.status(500).json({ error: 'internal_error', message: e.message });
  }
});

router.post('/annual', async (req, res) => {
  try {
    const url = await createCheckout({ plan: 'member', billing: 'annual', promo: readPromo(req.body?.promo) }, req);
    res.json({ url });
  } catch (e) {
    console.error('[pay/annual]', e);
    res.status(500).json({ error: 'internal_error', message: e.message });
  }
});

router.get('/success', (req, res) => {
  res.type('html').send(`<!doctype html><meta charset="utf-8"><title>Payment Success</title>
  <h1>Thank you!</h1>
  <p>Your payment succeeded. Session: ${req.query.session_id || '(n/a)'}</p>
  <p><a href="/">Back to site</a></p>`);
});

router.get('/cancel', (_req, res) => {
  res.type('html').send(`<!doctype html><meta charset="utf-8"><title>Payment Canceled</title>
  <h1>Payment canceled</h1>
  <p>No charge was made.</p>
  <p><a href="/#pricing">Try again</a></p>`);
});

export default router;
