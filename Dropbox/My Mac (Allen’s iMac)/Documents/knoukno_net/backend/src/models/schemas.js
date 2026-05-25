const mongoose = require("mongoose");

const objectRef = {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
};

const baseBusinessFields = {
  userId: objectRef,
  businessTitle: { type: String, required: true, trim: true },
  tier: {
    type: String,
    enum: ["free", "member", "pro"],
    default: "free"
  }
};

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "client"], default: "client" },
    tier: { type: String, enum: ["free", "member", "pro"], default: "free" },
    bonusQuestions: { type: Number, default: 0 },
    requirePasswordChange: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const loginAttemptSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    ip: { type: String, default: "" },
    success: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const registerAttemptSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    ip: { type: String, default: "" },
    success: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const paymentSchema = new mongoose.Schema(
  {
    userId: objectRef,
    paypalOrderId: { type: String, required: true },
    purchaseType: {
      type: String,
      enum: ["subscription", "bonus"],
      default: "subscription"
    },
    tier: { type: String, enum: ["member", "pro"] },
    bonusQuestions: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, default: "CREATED" },
    captureId: { type: String, default: "" }
  },
  { timestamps: true }
);

const titleSchema = new mongoose.Schema(
  {
    ...baseBusinessFields,
    text: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    ...baseBusinessFields,
    questionText: { type: String, required: true },
    source: { type: String, enum: ["ai", "client"], default: "ai" },
    index: { type: Number, default: 1 }
  },
  { timestamps: true }
);

const answerSchema = new mongoose.Schema(
  {
    ...baseBusinessFields,
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    answerText: { type: String, required: true },
    index: { type: Number, default: 1 }
  },
  { timestamps: true }
);

const gradeSchema = new mongoose.Schema(
  {
    ...baseBusinessFields,
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    score: { type: Number, min: 0, max: 100, required: true },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

const ratedSchema = new mongoose.Schema(
  {
    ...baseBusinessFields,
    targetType: {
      type: String,
      enum: ["question", "answer", "overall"],
      default: "overall"
    },
    targetId: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, required: true }
  },
  { timestamps: true }
);

const averageSchema = new mongoose.Schema(
  {
    ...baseBusinessFields,
    metric: { type: String, default: "overall" },
    value: { type: Number, required: true }
  },
  { timestamps: true }
);

const printSchema = new mongoose.Schema(
  {
    ...baseBusinessFields,
    html: { type: String, required: true }
  },
  { timestamps: true }
);

const saveSchema = new mongoose.Schema(
  {
    ...baseBusinessFields,
    payload: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

const deleteSchema = new mongoose.Schema(
  {
    userId: objectRef,
    collection: { type: String, required: true },
    deletedId: { type: String, required: true },
    reason: { type: String, default: "" }
  },
  { timestamps: true }
);

const emailSchema = new mongoose.Schema(
  {
    userId: objectRef,
    to: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, default: "queued" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);
const RegisterAttempt = mongoose.model("RegisterAttempt", registerAttemptSchema);
const Payment = mongoose.model("Payment", paymentSchema);
const Title = mongoose.model("Title", titleSchema);
const Question = mongoose.model("Question", questionSchema);
const Answer = mongoose.model("Answer", answerSchema);
const Grade = mongoose.model("Grade", gradeSchema);
const Rated = mongoose.model("Rated", ratedSchema);
const Average = mongoose.model("Average", averageSchema);
const PrintItem = mongoose.model("PrintItem", printSchema);
const SaveItem = mongoose.model("SaveItem", saveSchema);
const DeleteLog = mongoose.model("DeleteLog", deleteSchema);
const EmailLog = mongoose.model("EmailLog", emailSchema);

module.exports = {
  User,
  LoginAttempt,
  RegisterAttempt,
  Payment,
  Title,
  Question,
  Answer,
  Grade,
  Rated,
  Average,
  PrintItem,
  SaveItem,
  DeleteLog,
  EmailLog
};
