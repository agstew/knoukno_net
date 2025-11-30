export default function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    if (!req.user.role) return res.status(403).json({ error: 'forbidden' });
    if (req.user.role !== role) return res.status(403).json({ error: 'forbidden' });
    return next();
  };
}
