const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const { renderPrintTemplate } = require("../services/printTemplate");
const {
  Title,
  Question,
  Answer,
  Grade,
  Rated,
  Average,
  PrintItem,
  SaveItem,
  DeleteLog,
  EmailLog,
  LoginAttempt,
  RegisterAttempt,
  Payment
} = require("../models/schemas");
const { getQuestionAllowanceForUser } = require("../utils/tier");

const router = express.Router();

const collections = {
  title: Title,
  question: Question,
  answers: Answer,
  grade: Grade,
  rated: Rated,
  average: Average,
  print: PrintItem,
  save: SaveItem,
  delete: DeleteLog,
  email: EmailLog,
  login: LoginAttempt,
  register: RegisterAttempt,
  payment: Payment
};

router.get("/:name", authRequired, async (req, res) => {
  const model = collections[req.params.name];

  if (!model) {
    return res.status(404).json({ message: "Collection route not found." });
  }

  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize || 10)));
  const filter = req.user.role === "admin" ? {} : { userId: req.user.id };

  const [items, total] = await Promise.all([
    model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    model.countDocuments(filter)
  ]);

  return res.json({ page, pageSize, total, items });
});

router.post("/:name", authRequired, async (req, res) => {
  const model = collections[req.params.name];

  if (!model) {
    return res.status(404).json({ message: "Collection route not found." });
  }

  if (req.params.name === "question") {
    const used = await Question.countDocuments({ userId: req.user.id });
    const allowance = getQuestionAllowanceForUser(req.user);

    if (used >= allowance) {
      return res.status(403).json({
        message: "Question limit reached for your tier. Upgrade or buy a bonus pack.",
        allowance,
        used,
        remaining: 0
      });
    }
  }

  const payload = {
    ...req.body,
    userId: req.user.id,
    tier: req.user.tier
  };

  if (req.params.name === "print") {
    payload.html = renderPrintTemplate({
      title: req.body.businessTitle || "My Business",
      tier: req.user.tier,
      items: Array.isArray(req.body.items) ? req.body.items : []
    });
  }

  const item = await model.create(payload);
  return res.status(201).json(item);
});

router.delete("/:name/:id", authRequired, async (req, res) => {
  const model = collections[req.params.name];

  if (!model) {
    return res.status(404).json({ message: "Collection route not found." });
  }

  const filter = req.user.role === "admin"
    ? { _id: req.params.id }
    : { _id: req.params.id, userId: req.user.id };

  const deleted = await model.findOneAndDelete(filter);

  if (!deleted) {
    return res.status(404).json({ message: "Document not found." });
  }

  await DeleteLog.create({
    userId: req.user.id,
    collection: req.params.name,
    deletedId: req.params.id,
    reason: req.body.reason || "user_deleted"
  });

  return res.json({ message: "Deleted successfully." });
});

router.get("/admin/all-collections", authRequired, adminOnly, async (req, res) => {
  const entries = await Promise.all(
    Object.entries(collections).map(async ([name, model]) => {
      const total = await model.countDocuments();
      return {
        name,
        total,
        link: `/api/collections/${name}`
      };
    })
  );

  return res.json({ collections: entries });
});

module.exports = router;
