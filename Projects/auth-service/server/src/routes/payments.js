import { Router } from 'express';
import Stripe from 'stripe';
import { v4 as uuid } from 'uuid';
import { config } from '../config/env.js';
import { query, queryOne } from '../db/pool.js';
import { asyncHandler, badRequest, notFound } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { BONUS_PRICE_CENTS, TIERS, toDollars, totalCentsFor } from '../config/tiers.js';
import { applyTier } from '../services/entitlements.js';
import { createOrder, captureOrder, isPaypalConfigured } from '../services/paypal.js';
import { sendMail } from '../services/mailer.js';

const router = Router();

const isRealCredential = (value) =>
  Boolean(value) && !/replace|change|your[-_]?key|xxx/i.test(value);
const stripe = isRealCredential(config.stripe.secretKey)
  ? new Stripe(config.stripe.secretKey)
  : null;
const PAID_TIERS = ['member', 'pro'];

// Public pricing for the Price page and the footer.
router.get('/pricing', (_req, res) => {
  res.json({
    currency: 'USD',
    bonus: {
      questions: 100,
      priceCents: BONUS_PRICE_CENTS,
      price: toDollars(BONUS_PRICE_CENTS),
      label: 'Bonus: 100 extra questions',
    },
    tiers: Object.values(TIERS).map((t) => ({
      key: t.key,
      name: t.name,
      questions: t.questions,
      bonusQuestions: t.bonusQuestions || null,
      period: t.period,
      listPrice: toDollars(t.listPriceCents),
      price: toDollars(t.priceCents),
      savings: toDollars(t.listPriceCents - t.priceCents),
      discountPercent: t.discountPercent,
      bonusEligible: t.bonusEligible,
      features: t.features,
      excluded: t.excluded,
    })),
    providers: {
      stripe: Boolean(stripe) && isRealCredential(config.stripe.publishableKey),
      paypal: isPaypalConfigured(),
    },
  });
});

router.use(requireAuth);

function parseOrder(body) {
  const tier = v.oneOf(body.tier, 'Tier', PAID_TIERS);
  const bonus = v.bool(body.bonus) && TIERS[tier].bonusEligible;
  return { tier, bonus, amountCents: totalCentsFor(tier, bonus) };
}

async function recordPayment({ userId, provider, providerRef, tier, bonus, amountCents, status, raw }) {
  const id = uuid();
  await query(
    `INSERT INTO payments (id, user_id, provider, provider_ref, tier, bonus, amount_cents, status, raw)
     VALUES (:id, :userId, :provider, :providerRef, :tier, :bonus, :amountCents, :status, CAST(:raw AS JSON))
     ON DUPLICATE KEY UPDATE status = VALUES(status), raw = VALUES(raw)`,
    {
      id,
      userId,
      provider,
      providerRef,
      tier,
      bonus: bonus ? 1 : 0,
      amountCents,
      status,
      raw: JSON.stringify(raw || {}),
    },
  );
  return id;
}

async function fulfil({ user, tier, bonus, amountCents, provider, providerRef }) {
  await applyTier(user.id, tier, bonus);
  await query(
    `UPDATE payments SET status = 'paid' WHERE provider = :provider AND provider_ref = :ref`,
    { provider, ref: providerRef },
  );

  sendMail({
    to: user.email,
    template: 'receipt',
    userId: user.id,
    ctaUrl: `${config.appUrl}/title`,
    context: {
      tier: TIERS[tier].name,
      bonus,
      amount: `$${toDollars(amountCents)}`,
      questions: bonus ? TIERS[tier].bonusQuestions : TIERS[tier].questions,
    },
  }).catch((err) => console.warn('receipt email failed:', err.message));
}

// ---------- Stripe ----------
router.post(
  '/stripe/intent',
  asyncHandler(async (req, res) => {
    if (!stripe) throw badRequest('Stripe is not configured');
    const { tier, bonus, amountCents } = parseOrder(req.body);

    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: req.user.email,
      description: `${TIERS[tier].name}${bonus ? ' + Bonus 100 questions' : ''} — ${config.domain}`,
      metadata: { userId: req.user.id, tier, bonus: String(bonus) },
    });

    await recordPayment({
      userId: req.user.id,
      provider: 'stripe',
      providerRef: intent.id,
      tier,
      bonus,
      amountCents,
      status: 'pending',
      raw: { created: intent.created },
    });

    res.json({
      clientSecret: intent.client_secret,
      amount: toDollars(amountCents),
      publishableKey: config.stripe.publishableKey,
    });
  }),
);

// ---------- PayPal ----------
router.post(
  '/paypal/order',
  asyncHandler(async (req, res) => {
    if (!isPaypalConfigured()) throw badRequest('PayPal is not configured');
    const { tier, bonus, amountCents } = parseOrder(req.body);

    const order = await createOrder({
      amountCents,
      description: `${TIERS[tier].name}${bonus ? ' + Bonus 100 questions' : ''}`,
      referenceId: req.user.id,
    });

    await recordPayment({
      userId: req.user.id,
      provider: 'paypal',
      providerRef: order.id,
      tier,
      bonus,
      amountCents,
      status: 'pending',
      raw: { status: order.status },
    });

    res.json({ orderId: order.id, amount: toDollars(amountCents) });
  }),
);

router.post(
  '/paypal/capture',
  asyncHandler(async (req, res) => {
    if (!isPaypalConfigured()) throw badRequest('PayPal is not configured');
    const orderId = v.str(req.body.orderId, 'Order id', { max: 60 });

    // Tier and amount come from our own pending row, never from the client.
    const payment = await queryOne(
      `SELECT * FROM payments WHERE provider = 'paypal' AND provider_ref = :ref AND user_id = :userId LIMIT 1`,
      { ref: orderId, userId: req.user.id },
    );
    if (!payment) throw notFound('Order not found');
    if (payment.status === 'paid') return res.json({ ok: true, alreadyCaptured: true });

    const capture = await captureOrder(orderId);
    if (capture.status !== 'COMPLETED') {
      await query(`UPDATE payments SET status = 'failed' WHERE id = :id`, { id: payment.id });
      throw badRequest(`PayPal did not complete the payment (${capture.status})`);
    }

    await fulfil({
      user: req.user,
      tier: payment.tier,
      bonus: Boolean(payment.bonus),
      amountCents: payment.amount_cents,
      provider: 'paypal',
      providerRef: orderId,
    });

    res.json({ ok: true, tier: payment.tier, bonus: Boolean(payment.bonus) });
  }),
);

router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const payments = await query(
      `SELECT id, provider, tier, bonus, amount_cents, currency, status, created_at
         FROM payments WHERE user_id = :userId ORDER BY created_at DESC`,
      { userId: req.user.id },
    );
    res.json({
      payments: payments.map((p) => ({ ...p, amount: toDollars(p.amount_cents) })),
    });
  }),
);

/**
 * Stripe webhook. Mounted separately in index.js with a raw body parser so the
 * signature can be verified — this is the only trusted fulfilment path for Stripe.
 */
export const stripeWebhook = asyncHandler(async (req, res) => {
  if (!stripe || !config.stripe.webhookSecret) return res.status(503).end();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      config.stripe.webhookSecret,
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const payment = await queryOne(
      `SELECT * FROM payments WHERE provider = 'stripe' AND provider_ref = :ref LIMIT 1`,
      { ref: intent.id },
    );
    if (payment && payment.status !== 'paid') {
      const user = await queryOne('SELECT * FROM users WHERE id = :id', { id: payment.user_id });
      if (user) {
        await fulfil({
          user,
          tier: payment.tier,
          bonus: Boolean(payment.bonus),
          amountCents: payment.amount_cents,
          provider: 'stripe',
          providerRef: intent.id,
        });
      }
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    await query(
      `UPDATE payments SET status = 'failed' WHERE provider = 'stripe' AND provider_ref = :ref`,
      { ref: event.data.object.id },
    );
  }

  res.json({ received: true });
});

export default router;
