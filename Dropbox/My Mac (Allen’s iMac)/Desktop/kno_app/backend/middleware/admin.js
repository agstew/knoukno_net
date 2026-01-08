function requireAdmin(req, res, next){
  // `req.user` is populated by auth middleware JWT payload (id, role)
  if (!req.user) return res.redirect('/auth/login');
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden: admin only');
  return next();
}

module.exports = requireAdmin;
