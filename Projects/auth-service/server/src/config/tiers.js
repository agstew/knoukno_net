/**
 * Single source of truth for pricing and question quotas.
 * Amounts are in cents so Stripe/PayPal totals never drift.
 */
export const BONUS_QUESTIONS = 100;
export const BONUS_PRICE_CENTS = 10000; // $100.00

export const TIERS = {
  free: {
    key: 'free',
    name: 'Free Tier',
    questions: 5,
    period: '3 days',
    durationDays: 3,
    listPriceCents: 0,
    priceCents: 0,
    discountPercent: 0,
    bonusEligible: false,
    features: ['Business title', '5 questions', 'Save page', 'Print page'],
    excluded: ['Grade page', 'Rate page', 'Average page', 'Bonus questions'],
  },
  member: {
    key: 'member',
    name: 'Member Tier',
    questions: 50,
    period: 'month',
    durationDays: 30,
    listPriceCents: 4900, // $49.00
    priceCents: 3900, // $39.00 after 20% launch discount
    discountPercent: 20,
    bonusEligible: true,
    bonusQuestions: 150, // 50 + 100
    features: [
      'Business title',
      '50 questions / month',
      'Print page',
      'Save page',
      'Grade page',
      'Rate page',
      'Average page',
    ],
    excluded: [],
  },
  pro: {
    key: 'pro',
    name: 'Pro Tier',
    questions: 75,
    period: 'year',
    durationDays: 365,
    listPriceCents: 67500, // $675.00
    priceCents: 43600, // $436.00 after 35% launch discount
    discountPercent: 35,
    bonusEligible: true,
    bonusQuestions: 175, // 75 + 100
    features: [
      'Business title',
      '75 questions / year',
      'Print page',
      'Save page',
      'Grade page',
      'Rate page',
      'Average page',
    ],
    excluded: [],
  },
};

export const TIER_KEYS = Object.keys(TIERS);

export function quotaFor(tierKey, bonus = false) {
  const tier = TIERS[tierKey];
  if (!tier) return 0;
  return bonus && tier.bonusEligible ? tier.bonusQuestions : tier.questions;
}

export function totalCentsFor(tierKey, bonus = false) {
  const tier = TIERS[tierKey];
  if (!tier) return 0;
  return tier.priceCents + (bonus && tier.bonusEligible ? BONUS_PRICE_CENTS : 0);
}

export function toDollars(cents) {
  return (cents / 100).toFixed(2);
}
