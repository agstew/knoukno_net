import { verifyCapturedOrder } from './paypal.js';

const completedOrder = {
  status: 'COMPLETED',
  purchase_units: [
    {
      reference_id: 'user-1',
      payments: {
        captures: [
          { status: 'COMPLETED', amount: { currency_code: 'USD', value: '39.00' } },
        ],
      },
    },
  ],
};

describe('PayPal capture verification', () => {
  test('accepts the expected user, USD amount, and completed capture', () => {
    expect(verifyCapturedOrder(completedOrder, { amountCents: 3900, userId: 'user-1' })).toBe(true);
  });

  test.each([
    [{ amountCents: 4000, userId: 'user-1' }],
    [{ amountCents: 3900, userId: 'another-user' }],
  ])('rejects capture details that do not match the stored payment', (expected) => {
    expect(verifyCapturedOrder(completedOrder, expected)).toBe(false);
  });

  test('rejects an incomplete capture', () => {
    expect(
      verifyCapturedOrder({ ...completedOrder, status: 'APPROVED' }, { amountCents: 3900, userId: 'user-1' }),
    ).toBe(false);
  });
});