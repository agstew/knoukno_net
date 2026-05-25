const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { authLimiter } = require("../middleware/rateLimit");
const { authRequired } = require("../middleware/auth");
const {
  User,
  LoginAttempt,
  RegisterAttempt
} = require("../models/schemas");
const { normalizeTier } = require("../utils/tier");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      tier: user.tier
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

router.post("/register", authLimiter, async (req, res) => {
  const { email, password, tier } = req.body;
  const cleanEmail = (email || "").toLowerCase().trim();

  if (!cleanEmail || !password || password.length < 8) {
    return res.status(400).json({ message: "Email and strong password are required." });
  }

  const existing = await User.findOne({ email: cleanEmail }).lean();

  if (existing) {
    await RegisterAttempt.create({
      email: cleanEmail,
      ip: req.ip,
      success: false
    });

    return res.status(409).json({ message: "Email already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role = cleanEmail === env.adminEmail.toLowerCase() ? "admin" : "client";

  const user = await User.create({
    email: cleanEmail,
    passwordHash,
    role,
    tier: normalizeTier(tier)
  });

  await RegisterAttempt.create({ email: cleanEmail, ip: req.ip, success: true });

  const token = signToken(user);

  return res.status(201).json({
    token,
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      tier: user.tier,
      requirePasswordChange: Boolean(user.requirePasswordChange)
    }
  });
});

router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || "").toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });
  const passwordOk = user ? await bcrypt.compare(password || "", user.passwordHash) : false;

  await LoginAttempt.create({
    email: cleanEmail,
    ip: req.ip,
    success: Boolean(user && passwordOk)
  });

  if (!user || !passwordOk) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken(user);

  return res.json({
    token,
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      tier: user.tier,
      requirePasswordChange: Boolean(user.requirePasswordChange)
    }
  });
});

router.post("/change-password", authRequired, authLimiter, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      message: "Current password and a new password with at least 8 characters are required."
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      message: "New password must be different from current password."
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const passwordOk = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordOk) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.requirePasswordChange = false;
  await user.save();

  return res.json({
    message: "Password updated successfully.",
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      tier: user.tier,
      requirePasswordChange: false
    }
  });
});

module.exports = router;
