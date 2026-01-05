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
const payRoutes = require('./routes/pay');
app.use('/api/pay', payRoutes);
// Data routes (questions, answers, grades, etc.)
const dataRoutes = require('./routes/data');
app.use('/api/data', dataRoutes);
// Questions
const questionsRoutes = require('./routes/questions');
app.use('/api/questions', questionsRoutes);

// Admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Serve client static if present
const fs = require('fs');
const https = require('https');
const path = require('path');
app.use('/client', express.static(path.join(__dirname, 'client')));
const clientIndex = path.join(__dirname, 'client', 'index.html');
app.get('/', (req, res) => res.sendFile(clientIndex));
// Serve reset-password path to SPA so client can render reset form
app.get('/reset-password', (req, res) => res.sendFile(clientIndex));
// Serve client pages. Use standalone HTML for auth flows and SPA index for other views.
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'client', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'client', 'register.html')));
app.get('/forgot', (req, res) => res.sendFile(path.join(__dirname, 'client', 'forgot.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'client', 'admin.html')));
['/about', '/price'].forEach(p => app.get(p, (req, res) => res.sendFile(clientIndex)));

// expose helper for tests or manual connection
app.connectToMongo = connectToMongo;

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  // Optional HTTPS support when certificates are available.
  // Place your cert files in ./certs/localhost.pem and ./certs/localhost-key.pem
  const CERT_DIR = process.env.CERT_DIR || path.join(__dirname, 'certs');
  const keyPath = process.env.SSL_KEY || path.join(CERT_DIR, 'localhost-key.pem');
  const certPath = process.env.SSL_CERT || path.join(CERT_DIR, 'localhost.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    try {
      const key = fs.readFileSync(keyPath);
      const cert = fs.readFileSync(certPath);
      https.createServer({ key, cert }, app).listen(PORT, () => console.log(`HTTPS server running on port ${PORT}`));
    } catch (err) {
      console.error('Failed to start HTTPS server, falling back to HTTP:', err.message);
      app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));
    }
  } else {
    app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));
  }

  // Optional scheduled migration runner. Enable by setting MIGRATE_ENT_ENABLED=1
  if (process.env.MIGRATE_ENT_ENABLED === '1') {
    const migrate = require('./scripts/migrate_entitlements');
    const intervalMs = parseInt(process.env.MIGRATE_ENT_INTERVAL_MS || String(24 * 60 * 60 * 1000), 10);
    console.log('Scheduled entitlement migration enabled. Interval ms:', intervalMs);
    setInterval(() => {
      console.log('Running scheduled entitlement migration...');
      migrate.run({ dry: false }).then(r => console.log('Migration result:', r)).catch(err => console.error('Migration failed:', err));
    }, intervalMs);
  }
}
