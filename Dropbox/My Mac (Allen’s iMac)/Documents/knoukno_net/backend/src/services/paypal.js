const env = require("../config/env");

async function getPaypalAccessToken() {
  const auth = Buffer.from(
    `${env.paypalClientId}:${env.paypalClientSecret}`
  ).toString("base64");

  const tokenResponse = await fetch(`${env.paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!tokenResponse.ok) {
    throw new Error("Could not authenticate with PayPal API.");
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function callPaypalApi(path, { method = "GET", body, token }) {
  const response = await fetch(`${env.paypalApiBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`PayPal API request failed: ${method} ${path}`);
  }

  return response.json();
}

async function createPaypalOrder({ amount, currency = "USD", description }) {
  if (!env.paypalClientId || !env.paypalClientSecret) {
    return {
      id: `PAYPAL-MOCK-${Date.now()}`,
      status: "CREATED",
      links: [
        {
          rel: "approve",
          href: `${env.webUrl}/dashboard?mockPaypal=1`
        }
      ]
    };
  }

  const token = await getPaypalAccessToken();

  return callPaypalApi("/v2/checkout/orders", {
    method: "POST",
    token,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          description,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          }
        }
      ]
    }
  });
}

async function capturePaypalOrder(orderId) {
  if (!env.paypalClientId || !env.paypalClientSecret) {
    return {
      id: orderId,
      status: "COMPLETED",
      purchase_units: []
    };
  }

  const token = await getPaypalAccessToken();

  return callPaypalApi(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    token,
    body: {}
  });
}

module.exports = { createPaypalOrder, capturePaypalOrder };
