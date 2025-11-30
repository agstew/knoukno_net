import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRICE_STARTER     = process.env.STRIPE_PRICE_STARTER;
const PRICE_MEMBER      = process.env.STRIPE_PRICE_MEMBER;
const FRONTEND_FALLBACK = process.env.FRONTEND_BASE || 'http://127.0.0.1:5001';

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
const stripe = new Stripe(STRIPE_SECRET_KEY);

function frontBase(req) {
  const o = req.headers.origin;
  return (o && typeof o === 'string') ? o : FRONTEND_FALLBACK;
}

router.post('/checkout', async (req, res, next) => {
  try {
    const { plan } = req.body || {};
    const isMember = plan === 'member';
    const priceId  = isMember ? PRICE_MEMBER : PRICE_STARTER;
    if (!priceId) return res.status(500).json({ error: 'price_not_configured' });

    const session = await stripe.checkout.sessions.create({
      mode: isMember ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${frontBase(req)}/paidme/success.html?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontBase(req)}/paidme/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (err) { next(err); }
});

export default router;
