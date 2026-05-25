const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User } = require("../models/schemas");

async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Authorization token is required." });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid token user." });
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role,
      tier: user.tier,
      bonusQuestions: Number(user.bonusQuestions || 0),
      requirePasswordChange: Boolean(user.requirePasswordChange)
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized request." });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  return next();
}

module.exports = { authRequired, adminOnly };
