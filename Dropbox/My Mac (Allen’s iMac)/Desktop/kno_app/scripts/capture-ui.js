const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.URL || 'http://localhost:5000/questions';
  const outScreenshot = process.env.SCREENSHOT || '/tmp/questions.png';
  const outEvents = process.env.EVENTS || '/tmp/questions-events.json';
  const outHar = process.env.HAR || '/tmp/questions.har.json';
  const waitMs = parseInt(process.env.WAIT_MS || '1500', 10) || 1500;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const events = [];
  const consoles = [];

  page.on('request', (req) => {
    const rt = req.resourceType();
    // record all network requests for a full HAR-like trace
    events.push({ type: 'request', id: req._requestId || null, url: req.url(), method: req.method(), resourceType: rt });
  });

  page.on('response', async (res) => {
    try {
      const req = res.request();
      const rt = req.resourceType();
      const headers = res.headers();
      let text = '';
      try { text = await res.text(); } catch (e) { text = `<body read error: ${e.message}>`; }
      let parsed = null;
      try { parsed = JSON.parse(text); } catch (e) { parsed = text.length > 1000 ? text.slice(0,1000) + '...': text; }
      events.push({ type: 'response', url: res.url(), status: res.status(), resourceType: rt, headers, body: parsed });
    } catch (e) {
      events.push({ type: 'response-error', url: res.url(), message: e && e.message ? e.message : String(e) });
    }
  });

  page.on('console', msg => {
    consoles.push({ type: msg.type(), text: msg.text() });
    console.log('PAGE LOG>', msg.type(), msg.text());
  });

  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
    console.error('page.goto error:', e && e.message ? e.message : e);
  });

  // wait a configurable amount for background fetches to finish
  await new Promise((res) => setTimeout(res, waitMs));

  // take screenshot
  await page.screenshot({ path: outScreenshot, fullPage: true });

  // write events and console logs
  const out = { capturedAt: new Date().toISOString(), url, waitMs, events, consoles };
  try {
    fs.writeFileSync(outEvents, JSON.stringify(out, null, 2));
    fs.writeFileSync(outHar, JSON.stringify({ log: { entries: events } }, null, 2));
  } catch (e) {
    console.error('Failed to write event files:', e && e.message ? e.message : e);
  }

  console.log('Screenshot saved to', outScreenshot);
  console.log('Events saved to', outEvents);
  console.log('HAR-like saved to', outHar);

  await browser.close();
})();
