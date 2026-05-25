const express = require("express");
const { authRequired } = require("../middleware/auth");
const { Question } = require("../models/schemas");
const { getQuestionAllowanceForUser } = require("../utils/tier");
const {
  generateUniqueQuestions,
  generateUniqueExamples
} = require("../services/questionGenerator");

const router = express.Router();

router.get("/questions", authRequired, async (req, res) => {
  const requestedCount = Math.max(1, Math.min(300, Number(req.query.count || 300)));
  const questions = generateUniqueQuestions(requestedCount);

  return res.json({ count: questions.length, questions });
});

router.post("/questions/seed", authRequired, async (req, res) => {
  const requestedCount = Math.max(1, Math.min(300, Number(req.body.count || 300)));
  const used = await Question.countDocuments({ userId: req.user.id });
  const allowance = getQuestionAllowanceForUser(req.user);
  const remaining = Math.max(0, allowance - used);

  if (remaining <= 0) {
    return res.status(403).json({
      message: "Question limit reached for your tier. Upgrade or buy a bonus pack.",
      allowance,
      used,
      remaining: 0
    });
  }

  const countToCreate = Math.min(requestedCount, remaining);
  const questions = generateUniqueQuestions(countToCreate);

  const docs = questions.map((questionText, index) => ({
    userId: req.user.id,
    businessTitle: req.body.businessTitle || "My Business",
    tier: req.user.tier,
    questionText,
    source: "ai",
    index: index + 1
  }));

  const inserted = await Question.insertMany(docs);

  return res.status(201).json({
    message: "Questions created.",
    requestedCount,
    count: inserted.length,
    allowance,
    used,
    remaining: allowance - (used + inserted.length)
  });
});

router.get("/examples", authRequired, (req, res) => {
  const requestedCount = Math.max(1, Math.min(300, Number(req.query.count || 75)));
  const examples = generateUniqueExamples(requestedCount);

  return res.json({ count: examples.length, examples });
});

module.exports = router;
