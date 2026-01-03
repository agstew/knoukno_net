const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const stripeLib = require('stripe');

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Basic ping route
app.get('/ping', (req, res) => res.json({ ok: true, message: 'pong' }));

// Connect to MongoDB (skip automatic connect during tests)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kno_app';

async function connectToMongo(uri = MONGO_URI) {
  return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

if (process.env.NODE_ENV !== 'test') {
  connectToMongo().catch(err => {
    console.warn('MongoDB connection failed:', err.message);
  });
}

// Stripe init (if key set)
const stripe = process.env.STRIPE_SECRET_KEY ? stripeLib(process.env.STRIPE_SECRET_KEY) : null;

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const meRoutes = require('./routes/me');
app.use('/api', meRoutes);

// Serve client static if present
const path = require('path');
app.use('/client', express.static(path.join(__dirname, 'client')));
const clientIndex = path.join(__dirname, 'client', 'index.html');
app.get('/', (req, res) => res.sendFile(clientIndex));

// expose helper for tests or manual connection
app.connectToMongo = connectToMongo;

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
