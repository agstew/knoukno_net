const { version: platformVersion } = require('zapier-platform-core');
const packageJSON = require('./package.json');

const newUserTrigger       = require('./triggers/newUser');
const sendWelcomeEmailCreate = require('./creates/sendWelcomeEmail');

const App = {
  version: packageJSON.version,
  platformVersion,

  // Basic Auth using server URL + admin API token
  authentication: {
    type: 'custom',
    fields: [
      { key: 'serverUrl', label: 'Server URL', type: 'string', required: true,  helpText: 'Base URL of your Kno U Kno server, e.g. https://api.knoukno.com' },
      { key: 'apiToken',  label: 'API Token',  type: 'password', required: true, helpText: 'Admin JWT token from your Kno U Kno account settings' },
    ],
    test: {
      url: '{{bundle.authData.serverUrl}}/api/auth/me',
      headers: { Authorization: 'Bearer {{bundle.authData.apiToken}}' },
    },
  },

  triggers: {
    [newUserTrigger.key]: newUserTrigger,
  },

  creates: {
    [sendWelcomeEmailCreate.key]: sendWelcomeEmailCreate,
  },

  searches: {},
};

module.exports = App;
