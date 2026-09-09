import { config } from '../config/env.js';

const { paypal } = config;

const isRealCredential = (value) =>
  Boolean(value) && !/replace|change|your[-_]?key|xxx/i.test(value);

export const isPaypalConfigured = () =>
  isRealCredential(paypal.clientId) && isRealCredential(paypal.clientSecret);

async function accessToken() {
  const basic = Buffer.from(`${paypal.clientId}:${paypal.clientSecret}`).toString('base64');
  const res = await fetch(`${paypal.apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const data = await res.json();
  return data.access_token;
}

export async function createOrder({ amountCents, description, referenceId }) {
  const token = await accessToken();
  const res = await fetch(`${paypal.apiBase}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: referenceId,
          description: description.slice(0, 127),
          amount: { currency_code: 'USD', value: (amountCents / 100).toFixed(2) },
        },
      ],
      application_context: {
        brand_name: config.appName,
        user_action: 'PAY_NOW',
        return_url: `${config.appUrl}/checkout/success`,
        cancel_url: `${config.appUrl}/price`,
      },
    }),
  });
  if (!res.ok) throw new Error(`PayPal order failed: ${await res.text()}`);
  return res.json();
}

export async function captureOrder(orderId) {
  const token = await accessToken();
  const res = await fetch(`${paypal.apiBase}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`PayPal capture failed: ${await res.text()}`);
  return res.json();
}

export function verifyCapturedOrder(order, { amountCents, userId }) {
  if (order?.status !== 'COMPLETED') return false;
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const capturedCents = Math.round(Number(capture?.amount?.value) * 100);
  return (
    unit?.reference_id === userId &&
    capture?.status === 'COMPLETED' &&
    capture?.amount?.currency_code === 'USD' &&
    capturedCents === Number(amountCents)
  );
}
