const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const adminRoutes = require('./routes/admin');
const stripeRoutes = require('./routes/stripe');
const tiersRoutes = require('./routes/tiers');
const submissionsRoutes = require('./routes/submissions');

const app = express();

app.use(helmet());
app.use(cors());

// Stripe webhook requires the raw body, mount at /webhook BEFORE body parsers
app.post('/webhook', express.raw({ type: 'application/json' }), stripeRoutes.webhookHandler);

app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stripe', stripeRoutes.router);

app.use('/api/tiers', tiersRoutes);
app.use('/api/submissions', submissionsRoutes);

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/knoukno';

let serverInstance = null;

async function startServer() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected');
  serverInstance = app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

startServer().catch(err => { console.error('MongoDB connection error', err); process.exit(1); });

// Expose for tests
module.exports = {
  app,
  getServer: () => serverInstance,
  closeServer: async () => {
    try {
      if (serverInstance) {
        await new Promise((resolve, reject) => serverInstance.close(err => err ? reject(err) : resolve()));
        serverInstance = null;
      }
    } finally {
      try { await mongoose.disconnect(); } catch (e) { /* ignore */ }
    }
  }
};
