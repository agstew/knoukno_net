const tierLimits = { free: 5, members: 50, pro: 75 };

const checkTier = (requiredTier) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });
    const tierOrder = { free: 0, members: 1, pro: 2 };
    if (tierOrder[user.tier] >= tierOrder[requiredTier]) {
      if (user.tier === 'free' && user.tierExpiry) {
        const now = new Date();
        const expiry = new Date(user.tierExpiry);
        if (now > expiry) {
          return res.status(403).json({ message: 'Free trial expired. Please upgrade your plan.' });
        }
      }
      return next();
    }
    return res.status(403).json({ message: `This feature requires ${requiredTier} tier or higher.` });
  };
};

module.exports = { checkTier, tierLimits };
