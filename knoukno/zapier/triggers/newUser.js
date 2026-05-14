// Trigger: fires whenever a new user registers on Kno U Kno.
// The server sends a POST to ZAPIER_WEBHOOK_URL after saving the user.
// In Zapier, this trigger is connected to the "REST Hook" strategy:
//   - subscribe: Kno U Kno server stores the hook URL
//   - unsubscribe: Kno U Kno server removes the hook URL
//   - perform: Zapier receives the payload on the hook endpoint

const subscribeHook = async (z, bundle) => {
  const data = {
    url: bundle.targetUrl,
    event: 'new_user',
  };
  const response = await z.request({
    url: `${bundle.authData.serverUrl}/api/zapier/hooks`,
    method: 'POST',
    body: data,
  });
  return response.data;
};

const unsubscribeHook = async (z, bundle) => {
  const hookId = bundle.subscribeData.id;
  const response = await z.request({
    url: `${bundle.authData.serverUrl}/api/zapier/hooks/${hookId}`,
    method: 'DELETE',
  });
  return response.data;
};

// What Zapier receives when a new user registers
const getNewUser = (z, bundle) => bundle.cleanedRequest.data || [bundle.cleanedRequest];

// Sample payload used in the Zapier editor
const getFallbackSample = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.authData.serverUrl}/api/zapier/sample/users`,
    params: { limit: 1 },
  });
  return response.data.length ? response.data : [{ id: 'sample_id', name: 'Jane Doe', email: 'jane@example.com', tier: 'member', createdAt: new Date().toISOString() }];
};

module.exports = {
  key: 'new_user',
  noun: 'New User',

  display: {
    label: 'New User Registered',
    description: 'Triggers immediately when a new user registers on Kno U Kno.',
  },

  operation: {
    type: 'hook',

    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    perform: getNewUser,
    performList: getFallbackSample,

    sample: {
      id: 'sample_id',
      name: 'Jane Doe',
      email: 'jane@example.com',
      tier: 'member',
      createdAt: new Date().toISOString(),
    },
  },
};
