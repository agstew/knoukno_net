const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const root = path.resolve(__dirname);
  const pidFile = path.join(root, '.jest', 'server.pid');
  if (!fs.existsSync(path.join(root, '.jest'))) fs.mkdirSync(path.join(root, '.jest'));

  console.log('[jest.setup] Generating Prisma client and migrating test DB...');
  // Ensure test env
  const env = Object.assign({}, process.env, { DATABASE_URL: 'file:./test.db', JWT_SECRET: 'test_jwt_secret' });
  const prismaBin = path.join(root, 'node_modules', '.bin', 'prisma');
  try {
    execSync(`"${prismaBin}" generate`, { stdio: 'inherit', env });
  } catch (e) {
    // proceed even if generate fails
  }
  execSync(`"${prismaBin}" migrate dev --name init --skip-seed`, { stdio: 'inherit', env });
  execSync(`"${prismaBin}" db seed`, { stdio: 'inherit', env });

  console.log('[jest.setup] Starting server on port 5002');
  const outLog = path.join(root, '.jest', 'server.out.log');
  const errLog = path.join(root, '.jest', 'server.err.log');
  // truncate previous logs so we get fresh output
  try {
    fs.writeFileSync(outLog, '');
    fs.writeFileSync(errLog, '');
  } catch (e) {
    // ignore
  }
  const outStream = fs.createWriteStream(outLog, { flags: 'a' });
  const errStream = fs.createWriteStream(errLog, { flags: 'a' });

  const serverPath = path.join(root, 'src', 'server.mjs');
  const child = spawn(process.execPath, [serverPath], {
    env: Object.assign({}, process.env, { DATABASE_URL: 'file:./test.db', JWT_SECRET: 'test_jwt_secret', PORT: '5002', START_SERVER: '1' }),
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (child.stdout) child.stdout.pipe(outStream);
  if (child.stderr) child.stderr.pipe(errStream);
  fs.writeFileSync(pidFile, String(child.pid));
  // also write URL for tests
  fs.writeFileSync(path.join(root, '.jest', 'server.url'), 'http://127.0.0.1:5002');
  console.log('[jest.setup] Server started, pid=', child.pid);
  // wait for server to respond on /healthz
  const http = require('http');
  const url = 'http://127.0.0.1:5002/healthz';
  const maxAttempts = 30;
  let ok = false;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          resolve(res.statusCode === 204);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => {
          req.destroy();
          resolve(false);
        });
      }).then((val) => { ok = val; });
    } catch (e) {
      ok = false;
    }
    if (ok) break;
    await new Promise(r => setTimeout(r, 500));
  }
  if (!ok) {
    console.warn('[jest.setup] Server did not respond on /healthz in time');
    // Dump recent server logs for debugging
    try {
      const out = fs.existsSync(outLog) ? fs.readFileSync(outLog, 'utf8') : '';
      const err = fs.existsSync(errLog) ? fs.readFileSync(errLog, 'utf8') : '';
      console.warn('[jest.setup] === server.out.log ===');
      console.warn(out.split('\n').slice(-200).join('\n'));
      console.warn('[jest.setup] === server.err.log ===');
      console.warn(err.split('\n').slice(-200).join('\n'));
    } catch (e) {
      console.warn('[jest.setup] Could not read server log files', e && e.message);
    }
    // Check if process still exists
    try {
      process.kill(child.pid, 0);
      console.warn('[jest.setup] Server process still exists (pid=' + child.pid + ')');
    } catch (e) {
      console.warn('[jest.setup] Server process does not exist (might have exited)');
    }
  }
};
