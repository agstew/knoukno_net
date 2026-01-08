const User = require('../models/User');

async function requirePrivileged(req, res, next){
  if (!req.user) return res.redirect('/auth/login');
  // Allow admins
  if (req.user.role === 'admin') return next();
  // Load full user to check tier
  const user = await User.findById(req.user.id);
  if (!user) return res.redirect('/auth/login');
  if (user.tier === 'members' || user.tier === 'pro') return next();
  return res.status(403).send('Upgrade required');
}

module.exports = requirePrivileged;
