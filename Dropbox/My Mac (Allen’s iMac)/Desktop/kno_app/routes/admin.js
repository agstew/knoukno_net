const express = require('express');
const router = express.Router();
const Entitlement = require('../models/Entitlement');
const migrate = require('../scripts/migrate_entitlements');

// Simple admin auth via header X-Admin-Key matching ADMIN_KEY env var
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.admin_key || req.body && req.body.admin_key;
  if (!process.env.ADMIN_KEY) return res.status(501).json({ error: 'Admin API not configured' });
  if (!key || key !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'Forbidden' });
  next();
}

// List entitlements (paginated)
router.get('/entitlements', requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page || '0', 10);
  const perPage = parseInt(req.query.perPage || '50', 10);
  try {
    const items = await Entitlement.find({}).sort({ createdAt: -1 }).skip(page * perPage).limit(perPage).lean();
    const total = await Entitlement.countDocuments();
    res.json({ ok: true, items, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete entitlement
router.delete('/entitlements/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await Entitlement.deleteOne({ _id: id });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Trigger entitlement -> user migration (admin only)
router.post('/migrate-entitlements', requireAdmin, async (req, res) => {
  try {
    const dry = req.body && (req.body.dry === true || req.body.dry === 'true');
    const result = await migrate.run({ dry, connect: true });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
});

module.exports = router;
