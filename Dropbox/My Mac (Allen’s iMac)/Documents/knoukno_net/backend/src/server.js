const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const { connectDb } = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimit");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.webUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(apiLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "knoukno-api" });
});

app.get("/api", (req, res) => {
  res.json({
    name: "KnoUKno.net API",
    endpoints: [
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/change-password",
      "/api/payments/create-order",
      "/api/payments/capture-order",
      "/api/payments/webhook",
      "/api/ai/questions",
      "/api/collections/:name",
      "/api/dashboard/me",
      "/api/dashboard/admin"
    ]
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((error, req, res, next) => {
  const code = error.status || 500;
  return res.status(code).json({ message: error.message || "Server error" });
});

async function startServer() {
  try {
    await connectDb();
    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start API:", error);
    process.exit(1);
  }
}

startServer();
