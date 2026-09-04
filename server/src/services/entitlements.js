import { query, queryOne } from '../db/pool.js';
import { TIERS, quotaFor } from '../config/tiers.js';
import { paymentRequired } from '../lib/errors.js';

export function tierActive(user) {
  if (!user.tier_expires_at) return user.tier === 'free';
  return new Date(user.tier_expires_at).getTime() > Date.now();
}

export async function questionsUsed(userId, titleId = null) {
  const row = await queryOne(
    `SELECT COUNT(*) AS used
       FROM questions
      WHERE user_id = :userId
        AND (:titleId IS NULL OR title_id = :titleId)`,
    { userId, titleId },
  );
  return Number(row?.used || 0);
}

export async function entitlementsFor(user, titleId = null) {
  const tier = TIERS[user.tier] || TIERS.free;
  const bonus = Boolean(user.bonus);
  const quota = user.question_quota || quotaFor(user.tier, bonus);
  const used = await questionsUsed(user.id, titleId);
  const active = tierActive(user);

  return {
    tier: tier.key,
    tierName: bonus && tier.bonusEligible ? `${tier.name.replace(' Tier', '')}-Bonus Tier` : tier.name,
    bonus,
    quota,
    used,
    remaining: Math.max(0, quota - used),
    active,
    expiresAt: user.tier_expires_at,
    canGrade: tier.key !== 'free',
    canRate: tier.key !== 'free',
    canAverage: tier.key !== 'free',
    canPrint: true,
    canSave: true,
  };
}

/** Throws 402 when the plan is expired or the question quota is spent. */
export async function assertCanGenerate(user, count = 1, titleId = null) {
  const ent = await entitlementsFor(user, titleId);
  if (!ent.active) {
    throw paymentRequired(
      user.tier === 'free'
        ? 'Your 3-day free trial has ended. Choose a plan to keep going.'
        : 'Your plan has expired. Renew to keep generating questions.',
    );
  }
  if (ent.remaining < count) {
    throw paymentRequired(
      `You have ${ent.remaining} of ${ent.quota} questions left on the ${ent.tierName}. Upgrade or add the bonus pack for 100 more.`,
    );
  }
  return ent;
}

export async function applyTier(userId, tierKey, bonus = false) {
  const tier = TIERS[tierKey];
  if (!tier) throw new Error(`Unknown tier: ${tierKey}`);

  const expires = new Date();
  expires.setDate(expires.getDate() + tier.durationDays);

  await query(
    `UPDATE users
        SET tier = :tier,
            bonus = :bonus,
            question_quota = :quota,
            tier_started_at = NOW(),
            tier_expires_at = :expires
      WHERE id = :userId`,
    {
      tier: tier.key,
      bonus: bonus ? 1 : 0,
      quota: quotaFor(tier.key, bonus),
      expires,
      userId,
    },
  );
}
