const { spawn, spawnSync } = require('child_process');
// Use Jest's built-in `expect` instead of Chai
const { MongoMemoryServer } = require('mongodb-memory-server');

let BASE = process.env.BASE || 'http://localhost:3000';

async function post(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
    body: JSON.stringify(body || {})
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function login(email, password){
  const r = await post('/auth/login', { email, password });
  return r;
}

function runCreate(script, args = [], envAdd = {}){
  const env = Object.assign({}, process.env, envAdd);
  const res = spawnSync('node', [script, ...args], { stdio: 'inherit', env });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`Script ${script} failed with exit ${res.status}`);
}

function waitForServer(url, timeout = 10000){
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function ping(){
      fetch(url).then(r=>{
        if (r.ok) return resolve(true);
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for server')); 
        setTimeout(ping, 200);
      }).catch(()=>{
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for server')); 
        setTimeout(ping, 200);
      })
    })();
  });
}

describe('Dashboard permission tests', function(){
  jest.setTimeout(20000);
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'test-admin@example.com';
  const CLIENT_EMAIL = process.env.CLIENT_EMAIL || 'test-client@example.com';

  let adminToken, clientToken, questionId, answerId;

  let mongod;
  let serverProc;
  const TEST_PORT = process.env.TEST_PORT || null;

  function getFreePort(){
    return new Promise((resolve, reject)=>{
      const net = require('net');
      const srv = net.createServer();
      srv.listen(0, ()=>{
        const port = srv.address().port;
        srv.close(()=>resolve(port));
      });
      srv.on('error', reject);
    });
  }

  beforeAll(async () => {
    // start in-memory mongo
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // choose a free port if TEST_PORT not provided
    const port = TEST_PORT || await getFreePort();
    // spawn server.js with MONGODB_URI pointing to in-memory server and PORT
    const env = Object.assign({}, process.env, { MONGODB_URI: uri, PORT: String(port) });
    BASE = `http://localhost:${port}`;
    serverProc = spawn('node', ['server.js'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    // pipe logs to stderr for visibility in CI
    serverProc.stdout.pipe(process.stdout);
    serverProc.stderr.pipe(process.stderr);

    // wait for server to start
    await waitForServer(BASE + '/');

    // create test accounts using the create scripts with same MONGODB_URI
    runCreate('scripts/create_admin.js', ['Test Admin', ADMIN_EMAIL, 'Password123!'], env);
    runCreate('scripts/create_user.js', ['Test Client', CLIENT_EMAIL, 'Password123!', 'free', '--confirm'], env);

    const adminLogin = await login(ADMIN_EMAIL, 'Password123!');
    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.token;

    const clientLogin = await login(CLIENT_EMAIL, 'Password123!');
    expect(clientLogin.status).toBe(200);
    clientToken = clientLogin.body.token;
  });

  it('creates a question as admin', async function(){
    const r = await post('/dashboard/question', { text: 'Permissions test question', examples: ['ex1'] }, adminToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty('data');
    questionId = r.body.data._id;
    expect(questionId).toEqual(expect.any(String));
  });

  it('creates an answer as client', async function(){
    const clientUserId = extractUserId(clientToken);
    const r = await post('/dashboard/save', { userId: clientUserId, questionId, text: 'Client answer text' }, clientToken);
    expect(r.status).toBe(200);
    answerId = r.body.data._id;
  });

  it('prevents client from admin-only actions', async function(){
    const clientUserId = extractUserId(clientToken);
    const r1 = await post('/dashboard/save-all', { answers: [{ user: clientUserId, question: questionId, text: 'x' }] }, clientToken);
    expect(r1.status).toBe(403);
    const r2 = await post('/dashboard/save-grade', { answerIds: [answerId], grade: 9 }, clientToken);
    expect(r2.status).toBe(403);
  });

  it('allows admin to perform admin-only actions', async function(){
    const clientUserId = extractUserId(clientToken);
    const r1 = await post('/dashboard/save-all', { answers: [{ user: clientUserId, question: questionId, text: 'admin-created' }] }, adminToken);
    expect(r1.status).toBe(200);
    const r2 = await post('/dashboard/save-grade', { answerIds: [answerId], grade: 8 }, adminToken);
    expect(r2.status).toBe(200);
  });

  it('enforces delete ownership (client cannot delete others answer; admin can)', async function(){
    // create another client user and an answer belonging to them
    const OTHER_EMAIL = 'other-client@example.com';
    runCreate('scripts/create_user.js', ['Other Client', OTHER_EMAIL, 'Password123!', 'free', '--confirm'], { MONGODB_URI: mongod.getUri() });
    const otherLogin = await login(OTHER_EMAIL, 'Password123!');
    expect(otherLogin.status).toBe(200);
    const otherToken = otherLogin.body.token;
    const otherUserId = extractUserId(otherToken);
    // other user creates an answer for the same question
    const or = await post('/dashboard/save', { userId: otherUserId, questionId, text: 'Other answer' }, otherToken);
    expect(or.status).toBe(200);
    const otherAnswerId = or.body.data._id;

    // client (first) attempts to delete other's answer -> forbidden
    const cdel = await post('/dashboard/delete', { answerId: otherAnswerId }, clientToken);
    expect(cdel.status).toBe(403);

    // admin deletes other's answer -> allowed
    const adel = await post('/dashboard/delete', { answerId: otherAnswerId }, adminToken);
    expect(adel.status).toBe(200);
  });

  it('enforces bulk save-answers ownership (non-admin only affects own answers)', async function(){
    // create two answers: one for client, one for client (we already have answerId). create another for client via save-all as admin
    const clientUserId = extractUserId(clientToken);
    const createRes = await post('/dashboard/save-all', { answers: [{ user: clientUserId, question: questionId, text: 'bulk1' }] }, adminToken);
    expect(createRes.status).toBe(200);
    // fetch answers list to get ids
    const list = await post('/dashboard/answers', { list: true }, clientToken);
    expect(list.status).toBe(200);
    const ids = (list.body && list.body.data) ? list.body.data.map(a=>a._id) : (list.body && list.body.data ? [list.body.data._id] : []);
    // attempt to mark all those ids as saved as non-admin
    const mark = await post('/dashboard/save-answers', { answerIds: ids }, clientToken);
    expect(mark.status).toBe(200);
    // check modifiedCount or nModified to be present
    const result = mark.body && mark.body.data;
    const modified = (result && (result.modifiedCount || result.nModified || result.n)) || 0;
    expect(modified).toBeGreaterThanOrEqual(1);
    // admin can mark any (no error)
    const mark2 = await post('/dashboard/save-answers', { answerIds: ids }, adminToken);
    expect(mark2.status).toBe(200);
  });

  afterAll(async () => {
    // run cleanup script to remove users/questions
    spawnSync('node', ['scripts/cleanup_test_data.js', '--admin-email', ADMIN_EMAIL, '--client-email', CLIENT_EMAIL, '--aggressive'], { stdio: 'inherit', env: Object.assign({}, process.env, { MONGODB_URI: mongod.getUri() }) });
    // stop server process
    if (serverProc && !serverProc.killed) {
      serverProc.kill('SIGTERM');
    }
    // stop in-memory mongo
    if (mongod) await mongod.stop();
  });
});

// Helpers to extract user id from token (JWT) without verifying signature
function extractUserId(token){
  try{
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload.id;
  }catch(e){ return null; }
}
