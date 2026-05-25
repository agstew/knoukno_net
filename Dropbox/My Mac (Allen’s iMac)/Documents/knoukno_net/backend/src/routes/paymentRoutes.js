const express = require("express");
const { authRequired } = require("../middleware/auth");
const { Payment, User } = require("../models/schemas");
const { TIER_RULES, normalizeTier } = require("../utils/tier");
const { createPaypalOrder, capturePaypalOrder } = require("../services/paypal");

const router = express.Router();

router.post("/create-order", authRequired, async (req, res) => {
  const purchaseType = req.body.purchaseType === "bonus" ? "bonus" : "subscription";
  const requestedTier = normalizeTier(req.body.tier);

  let targetTier;
  let amount;
  let description;
  let bonusQuestions = 0;

  if (purchaseType === "bonus") {
    targetTier = normalizeTier(req.user.tier);

    if (targetTier === "free") {
      return res.status(400).json({ message: "Upgrade to Member or Pro before buying bonus packs." });
    }

    const rule = TIER_RULES[targetTier];
    amount = Number(rule.bonusPackPrice || 100);
    bonusQuestions = Number(rule.bonusPack || 0);
    description = `KnoUKno.net ${targetTier} bonus question pack (${bonusQuestions})`;
  } else {
    targetTier = requestedTier;

    if (targetTier === "free") {
      return res.status(400).json({ message: "Free tier does not need payment." });
    }

    const rule = TIER_RULES[targetTier];
    amount = Number(rule.discountedPrice || rule.price);
    description = `KnoUKno.net ${targetTier} tier subscription`;
  }

  const paypalOrder = await createPaypalOrder({
    amount,
    description
  });

  await Payment.create({
    userId: req.user.id,
    paypalOrderId: paypalOrder.id,
    purchaseType,
    tier: purchaseType === "subscription" ? targetTier : undefined,
    bonusQuestions,
    amount,
    status: paypalOrder.status
  });

  return res.status(201).json({
    order: paypalOrder,
    purchaseType,
    tier: purchaseType === "subscription" ? targetTier : req.user.tier,
    bonusQuestions,
    amount
  });
});

router.post("/capture-order", authRequired, async (req, res) => {
  const orderId = String(req.body.orderId || "").trim();

  if (!orderId) {
    return res.status(400).json({ message: "orderId is required." });
  }

  const payment = await Payment.findOne({ paypalOrderId: orderId, userId: req.user.id });

  if (!payment) {
    return res.status(404).json({ message: "Payment order not found." });
  }

  if (payment.status === "COMPLETED" || payment.status === "CAPTURED") {
    const user = await User.findById(req.user.id).lean();
    return res.json({ message: "Order already captured.", payment, user });
  }

  const capture = await capturePaypalOrder(orderId);

  const captureId =
    capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id || "";

  payment.status = capture.status || "COMPLETED";
  payment.captureId = captureId;
  await payment.save();

  const update = {};

  if (payment.purchaseType === "subscription" && payment.tier) {
    update.tier = payment.tier;
  }

  if (payment.purchaseType === "bonus" && payment.bonusQuestions > 0) {
    update.$inc = { bonusQuestions: payment.bonusQuestions };
  }

  if (Object.keys(update).length > 0) {
    await User.findByIdAndUpdate(req.user.id, update, { new: true });
  }

  const user = await User.findById(req.user.id).lean();

  return res.json({
    message: "Order captured.",
    payment,
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      tier: user.tier,
      bonusQuestions: user.bonusQuestions || 0
    }
  });
});

router.post("/webhook", async (req, res) => {
  const eventType = req.body?.event_type;
  const orderId =
    req.body?.resource?.id ||
    req.body?.resource?.supplementary_data?.related_ids?.order_id;

  if (!eventType || !orderId) {
    return res.status(200).json({ received: true });
  }

  if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
    await Payment.findOneAndUpdate(
      { paypalOrderId: orderId },
      {
        status: eventType === "PAYMENT.CAPTURE.COMPLETED" ? "COMPLETED" : "APPROVED"
      }
    );
  }

  return res.status(200).json({ received: true });
});

module.exports = router;
