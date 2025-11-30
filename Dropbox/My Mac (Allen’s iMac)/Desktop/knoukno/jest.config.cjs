module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['mjs', 'js', 'json'],
  testMatch: ['**/tests/**/*.test.js'],
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',
  verbose: true,
};
