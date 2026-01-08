const path = require('path');
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// If running behind a proxy/load-balancer that terminates TLS (e.g., Heroku, Cloudflare),
// enable trust proxy so Express knows the original request protocol for secure cookies.
app.set('trust proxy', 1);

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/kno';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo error', err));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

// Parse cookies early so downstream middleware (templates, auth) can read them
app.use(cookieParser());

// Stripe webhook needs the raw body; handle webhook route before json body parsing
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const jwt = require('jsonwebtoken');

// Populate current user for templates when token cookie exists
app.use(async (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me-please');
    req.user = payload;
    const User = require('./models/User');
    const u = await User.findById(payload.id);
    if (u) res.locals.currentUser = u;
  } catch (e) {
    // ignore token errors
  }
  return next();
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event = null;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const tier = metadata.tier;
    if (userId && tier) {
      try {
        const User = require('./models/User');
        const user = await User.findById(userId);
        if (user) {
          const now = new Date();
          if (tier === 'members') {
            user.tier = 'members';
            user.tierExpires = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
            user.questionsRemaining = 175;
          } else if (tier === 'pro') {
            user.tier = 'pro';
            user.tierExpires = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
            user.questionsRemaining = 75;
          } else if (tier === 'bonus') {
            user.questionsRemaining = (user.questionsRemaining || 0) + 100;
          }
          await user.save();
          console.log(`Updated user ${user.email} after purchase: ${tier}`);
        }
      } catch (err) {
        console.error('Error updating user after stripe event', err);
      }
    }
  }

  res.json({ received: true });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// CSRF protection: enabled except during test runs (tests use mongodb-memory-server)
if (process.env.NODE_ENV !== 'test') {
  const csurf = require('csurf');
  // Use cookie-based CSRF tokens so we don't need server sessions
  app.use(csurf({ cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' } }));
  // expose token to templates and JS via res.locals
  app.use((req, res, next) => {
    try {
      res.locals.csrfToken = req.csrfToken();
    } catch (err) {
      // on some non-GET requests csurf may throw; ignore here and let route handlers respond
    }
    next();
  });
}

// Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/payments', require('./routes/payments'));
app.use('/admin', require('./routes/admin'));

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
