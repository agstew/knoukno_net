// Stores Zapier REST-hook subscriptions in memory (use DB in production).
// Fires the registered hook URL whenever Kno U Kno emits an event.

const express = require('express');
const router = express.Router();
const axios  = require('axios');

const hooks = {}; // { [id]: { id, url, event } }

// Zapier calls this when a Zap is turned ON
router.post('/', (req, res) => {
  const { url, event } = req.body;
  if (!url || !event) return res.status(400).json({ message: 'url and event required' });
  const id = require('uuid').v4();
  hooks[id] = { id, url, event };
  res.status(201).json({ id });
});

// Zapier calls this when a Zap is turned OFF
router.delete('/:id', (req, res) => {
  delete hooks[req.params.id];
  res.json({ deleted: true });
});

// Sample endpoint — Zapier polls this to prefill the Zap editor
router.get('/sample/users', (req, res) => {
  res.json([{ id: 'sample_id', name: 'Jane Doe', email: 'jane@example.com', tier: 'member', createdAt: new Date().toISOString() }]);
});

// Internal helper: call all hooks registered for a given event
router.fireEvent = async (event, payload) => {
  const targets = Object.values(hooks).filter(h => h.event === event);
  for (const hook of targets) {
    try {
      await axios.post(hook.url, { data: [payload] });
    } catch (err) {
      console.error(`Zapier hook ${hook.id} failed:`, err.message);
    }
  }
};

module.exports = router;
