// Action: sends a personalised welcome email to the newly registered user.
// Zapier routes this through the Kno U Kno server email endpoint so that
// the same nodemailer/SMTP credentials are used.

const sendWelcome = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.authData.serverUrl}/api/email/individual`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bundle.authData.apiToken}`,
    },
    body: {
      to: bundle.inputData.email,
      name: bundle.inputData.name,
      subject: 'Welcome to Kno U Kno — Your Business Journey Starts Here',
      message: `Hi ${bundle.inputData.name},\n\nThank you for registering with Kno U Kno!\n\nYour account has been created with the "${bundle.inputData.tier}" tier. Log in any time to start answering your business readiness questions and discover exactly where you stand.\n\n— The Kno U Kno Team`,
    },
  });
  return response.data;
};

module.exports = {
  key: 'send_welcome_email',
  noun: 'Welcome Email',

  display: {
    label: 'Send Welcome Email',
    description: 'Sends a personalised welcome email to a newly registered Kno U Kno user.',
  },

  operation: {
    inputFields: [
      { key: 'email', label: 'Recipient Email', type: 'string', required: true },
      { key: 'name',  label: 'Recipient Name',  type: 'string', required: true },
      { key: 'tier',  label: 'User Tier',        type: 'string', required: false },
    ],
    perform: sendWelcome,
    sample: {
      id: 'email_ok',
      status: 'sent',
    },
  },
};
