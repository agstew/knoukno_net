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
    term: '2-year subscription',
    durationDays: 730,
    listPriceCents: 4900, // $49.00
    priceCents: 3900, // $39.00 after 20% launch discount
    discountPercent: 20,
    bonusEligible: false,
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
  member_bonus: {
    key: 'member_bonus',
    name: 'Member-Bonus Tier',
    questions: 150,
    period: 'month',
    term: '2-year subscription',
    durationDays: 730,
    listPriceCents: 19900,
    priceCents: 19900,
    discountPercent: 0,
    bonusEligible: false,
    features: [
      'Business title',
      '150 questions / month',
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
    period: 'month',
    term: '2-year subscription',
    durationDays: 730,
    listPriceCents: 9900,
    priceCents: 9900,
    discountPercent: 0,
    bonusEligible: false,
    features: [
      'Business title',
      '75 questions / month',
      'Print page',
      'Save page',
      'Grade page',
      'Rate page',
      'Average page',
    ],
    excluded: [],
  },
  pro_bonus: {
    key: 'pro_bonus',
    name: 'Pro-Bonus Tier',
    questions: 175,
    period: 'month',
    term: '2-year subscription',
    durationDays: 730,
    listPriceCents: 29900,
    priceCents: 29900,
    discountPercent: 0,
    bonusEligible: false,
    features: [
      'Business title',
      '175 questions / month',
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
export const PAID_TIER_KEYS = TIER_KEYS.filter((key) => key !== 'free');

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
