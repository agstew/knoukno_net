#!/usr/bin/env node
/*
  send_signed_webhook.js

  Generate a Stripe-style signed webhook header and optionally POST
  a test payload to a local `/webhook` endpoint.

  Usage:
    # print signature and payload (no network)
    node backend/scripts/send_signed_webhook.js --print --secret=my_webhook_secret

    # send signed POST to localhost
    node backend/scripts/send_signed_webhook.js --secret=my_webhook_secret --url=http://localhost:3000/webhook --send

  If `--secret` is not passed, the script will check `STRIPE_WEBHOOK_SECRET` env var.
*/

const crypto = require('crypto');

function usage() {
  console.log('Usage: node backend/scripts/send_signed_webhook.js --secret=whsec_... [--url=http://localhost:3000/webhook] [--send] [--event=checkout.session.completed] [--print]');
}

function parseArgs(args) {
  const out = {};
  args.forEach(a => {
    if (!a.startsWith('--')) return;
    const kv = a.slice(2);
    const eq = kv.indexOf('=');
    if (eq === -1) out[kv] = true;
    else out[kv.slice(0, eq)] = kv.slice(eq + 1);
  });
  return out;
}

const argv = parseArgs(process.argv.slice(2));
const secret = argv.secret || process.env.STRIPE_WEBHOOK_SECRET;
if (!secret) {
  console.error('Error: webhook secret not provided. Use --secret or set STRIPE_WEBHOOK_SECRET');
  usage();
  process.exit(1);
}

const url = argv.url || process.env.WEBHOOK_URL || 'http://localhost:3000/webhook';
const eventType = argv.event || 'checkout.session.completed';
const send = argv.send || false;
const doPrint = argv.print || true;

const payload = {
  id: `evt_${Math.random().toString(36).slice(2,10)}`,
  object: 'event',
  type: eventType,
  data: {
    object: {
      id: `cs_${Math.random().toString(36).slice(2,12)}`,
      amount_total: 1000,
      currency: 'usd'
    }
  }
};

const payloadStr = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payloadStr}`;
const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
const header = `t=${timestamp},v1=${signature}`;

async function main() {
  if (doPrint) {
    console.log('Generated Stripe-Signature header:');
    console.log('Stripe-Signature:', header);
    console.log('\nPayload:');
    console.log(payloadStr);
  }

  if (send) {
    if (typeof fetch === 'undefined') {
      // dynamic import fetch for older Node versions
      global.fetch = (await import('node-fetch')).default;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': header
        },
        body: payloadStr
      });
      console.log('\nPOST', url, '->', res.status);
      const text = await res.text();
      console.log(text);
    } catch (err) {
      console.error('Error sending webhook:', err.message || err);
      process.exit(2);
    }
  }
}

main();
