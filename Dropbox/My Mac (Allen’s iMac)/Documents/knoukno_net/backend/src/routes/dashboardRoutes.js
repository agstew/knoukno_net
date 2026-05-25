const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const env = require("../config/env");
const { TIER_RULES, getQuestionAllowanceForUser } = require("../utils/tier");
const {
  User,
  Payment,
  Question,
  Answer,
  Grade,
  Rated,
  Average
} = require("../models/schemas");

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  const [questions, answers] = await Promise.all([
    Question.countDocuments({ userId: req.user.id }),
    Answer.countDocuments({ userId: req.user.id })
  ]);

  const allowance = getQuestionAllowanceForUser(req.user);

  return res.json({
    user: req.user,
    usage: { questions, answers },
    quota: {
      allowance,
      remaining: Math.max(0, allowance - questions)
    },
    tierRule: TIER_RULES[req.user.tier],
    adminEmail: env.adminEmail
  });
});

router.get("/admin", authRequired, adminOnly, async (req, res) => {
  const [users, payments, questions, answers, grades, ratings, averages] =
    await Promise.all([
      User.countDocuments(),
      Payment.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments(),
      Grade.countDocuments(),
      Rated.countDocuments(),
      Average.countDocuments()
    ]);

  return res.json({
    adminEmail: env.adminEmail,
    totals: { users, payments, questions, answers, grades, ratings, averages },
    collectionLinks: [
      "/api/collections/payment",
      "/api/collections/title",
      "/api/collections/login",
      "/api/collections/register",
      "/api/collections/print",
      "/api/collections/save",
      "/api/collections/question",
      "/api/collections/grade",
      "/api/collections/rated",
      "/api/collections/answers",
      "/api/collections/average",
      "/api/collections/delete",
      "/api/collections/email"
    ]
  });
});

module.exports = router;
