const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const root = path.resolve(__dirname);
  const pidFile = path.join(root, '.jest', 'server.pid');
  try {
    if (fs.existsSync(pidFile)) {
      const pid = Number(fs.readFileSync(pidFile, 'utf8'));
      try {
        process.kill(pid, 'SIGTERM');
        console.log('[jest.teardown] Killed server pid', pid);
      } catch (e) {
        console.warn('[jest.teardown] Could not kill pid', pid, e.message);
      }
      fs.unlinkSync(pidFile);
    }
  } catch (e) {
    console.error('[jest.teardown] Error during teardown', e);
  }
};
