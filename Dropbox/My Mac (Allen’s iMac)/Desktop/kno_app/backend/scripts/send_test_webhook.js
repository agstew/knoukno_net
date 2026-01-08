#!/usr/bin/env node
/*
 Simple helper to POST a test payload to the local /webhook endpoint.
 This is a convenience smoke-test only and does NOT generate a valid
 Stripe signature header. Use the Stripe CLI (`stripe listen`) for
 signed, real Stripe events.
*/

const url = process.env.WEBHOOK_URL || 'http://localhost:3000/webhook';

const payload = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_123', amount_total: 1000, currency: 'usd' } }
};

async function send() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=1,v1=test'
      },
      body: JSON.stringify(payload)
    });

    console.log('POST', url, '->', res.status);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error('Error sending webhook:', err.message || err);
    process.exit(2);
  }
}

send();
