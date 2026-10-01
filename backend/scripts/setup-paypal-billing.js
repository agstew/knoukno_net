// One-time setup: creates a PayPal Product + two Billing Plans (Members monthly,
// Pro yearly) and a Webhook subscription, then prints the IDs to store as env vars:
//   PAYPAL_PLAN_MEMBERS, PAYPAL_PLAN_PRO, PAYPAL_WEBHOOK_ID
// Safe to run: creating these resources does not charge any money.
// Usage: node scripts/setup-paypal-billing.js
require('dotenv').config();

const paypalBase = () =>
  process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

const paypalToken = async () => {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status}): ${await res.text()}`);
  return (await res.json()).access_token;
};

const paypal = async (path, options = {}) => {
  const token = await paypalToken();
  const res = await fetch(`${paypalBase()}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': options.requestId, ...options.headers }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} failed (${res.status}): ${JSON.stringify(data)}`);
  return data;
};

async function createProduct() {
  return paypal('/v1/catalogs/products', {
    method: 'POST',
    requestId: 'knoukno-product-v1',
    body: JSON.stringify({
      name: 'Kno U Kno Membership',
      description: 'Guided business-planning question access',
      type: 'SERVICE',
      category: 'SOFTWARE'
    })
  });
}

async function createPlan(productId, { name, value, intervalUnit }) {
  return paypal('/v1/billing/plans', {
    method: 'POST',
    requestId: `knoukno-plan-${name.toLowerCase()}-v1`,
    body: JSON.stringify({
      product_id: productId,
      name: `Kno U Kno ${name}`,
      billing_cycles: [
        {
          frequency: { interval_unit: intervalUnit, interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: { fixed_price: { value, currency_code: 'USD' } }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CANCEL',
        payment_failure_threshold: 3
      }
    })
  });
}

async function createWebhook(url) {
  return paypal('/v1/notifications/webhooks', {
    method: 'POST',
    body: JSON.stringify({
      url,
      event_types: [
        { name: 'BILLING.SUBSCRIPTION.ACTIVATED' },
        { name: 'BILLING.SUBSCRIPTION.CANCELLED' },
        { name: 'BILLING.SUBSCRIPTION.EXPIRED' },
        { name: 'BILLING.SUBSCRIPTION.SUSPENDED' },
        { name: 'PAYMENT.SALE.COMPLETED' }
      ]
    })
  });
}

(async () => {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are required in the environment.');
    process.exit(1);
  }

  console.log(`Using PayPal ${process.env.PAYPAL_ENV || 'sandbox'} environment: ${paypalBase()}`);

  const product = await createProduct();
  console.log('Product created:', product.id);

  const members = await createPlan(product.id, { name: 'Members', value: '39.00', intervalUnit: 'MONTH' });
  console.log('Members plan created:', members.id);

  const pro = await createPlan(product.id, { name: 'Pro', value: '436.00', intervalUnit: 'YEAR' });
  console.log('Pro plan created:', pro.id);

  const webhookUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/payment/webhook`;
  const webhook = await createWebhook(webhookUrl);
  console.log('Webhook created:', webhook.id, '->', webhookUrl);

  console.log('\nSet these environment variables:');
  console.log(`PAYPAL_PLAN_MEMBERS=${members.id}`);
  console.log(`PAYPAL_PLAN_PRO=${pro.id}`);
  console.log(`PAYPAL_WEBHOOK_ID=${webhook.id}`);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
