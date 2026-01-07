const express = require('express');
const router = express.Router();
const Tier = require('../models/Tier');

router.get('/', async (req, res) => {
  try {
    const tiers = await Tier.find().sort({ price: 1 });
    res.json(tiers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
