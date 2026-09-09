import { PAID_TIER_KEYS, TIERS, quotaFor, totalCentsFor } from './tiers.js';

describe('Kno U Kno plan contract', () => {
  test.each([
    ['free', 5, 0, 3],
    ['member', 50, 3900, 730],
    ['pro', 75, 9900, 730],
    ['member_bonus', 150, 19900, 730],
    ['pro_bonus', 175, 29900, 730],
  ])('%s has the requested quota, price, and term', (key, quota, cents, days) => {
    expect(quotaFor(key)).toBe(quota);
    expect(totalCentsFor(key)).toBe(cents);
    expect(TIERS[key].durationDays).toBe(days);
  });

  test('all four paid plans are available to checkout', () => {
    expect(PAID_TIER_KEYS).toEqual(['member', 'member_bonus', 'pro', 'pro_bonus']);
  });
});