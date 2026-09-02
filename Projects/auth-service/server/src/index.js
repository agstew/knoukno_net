import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { parseCookies } from './lib/cookies.js';
import { ping } from './db/pool.js';

import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import titleRoutes from './routes/titles.js';
import questionRoutes from './routes/questions.js';
import answerRoutes from './routes/answers.js';
import gradeRoutes from './routes/grades.js';
import ratingRoutes from './routes/ratings.js';
import averageRoutes from './routes/averages.js';
import printRoutes from './routes/print.js';
import contentRoutes from './routes/content.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes, { stripeWebhook } from './routes/payments.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: config.isProd ? undefined : false,
  }),
);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);

// Stripe needs the untouched raw body to verify its signature, so it is mounted
// before the JSON parser.
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, _res, next) => {
  req.cookies = parseCookies(req.headers.cookie);
  next();
});
app.use('/api', apiLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/averages', averageRoutes);
app.use('/api/print', printRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, async () => {
  console.log(`${config.appName} API listening on :${config.port} (${config.env})`);
  try {
    await ping();
    console.log(`GoDaddy MySQL is connected for ${config.domain}.`);
  } catch (err) {
    console.warn(`MySQL not reachable yet: ${err.code || err.message}`);
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down.`);
    server.close(() => process.exit(0));
  });
}

export default app;
