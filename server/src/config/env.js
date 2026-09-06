import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../../.env') });
dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

export const config = {
  env,
  isProd,
  port: Number(process.env.PORT || 4000),
  appName: process.env.APP_NAME || 'Kno U Kno',
  domain: process.env.APP_DOMAIN || 'knoukno.net',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  supportEmail: process.env.SUPPORT_EMAIL || 'knoukno006@gmail.com',

  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(process.env.DB_PORT || 3306),
    user: required('DB_USER', 'root'),
    password: process.env.DB_PASSWORD || '',
    database: required('DB_NAME', 'knoukno'),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  },

  jwt: {
    // Secrets are only allowed to fall back to a dev value outside production.
    secret: isProd ? required('JWT_SECRET') : process.env.JWT_SECRET || 'dev-only-access-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    refreshSecret: isProd
      ? required('JWT_REFRESH_SECRET')
      : process.env.JWT_REFRESH_SECRET || 'dev-only-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  passwordResetTtlMinutes: Number(process.env.PASSWORD_RESET_TTL_MINUTES || 60),

  cookie: {
    // Must be 'none' when the API runs on a different site than the frontend.
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
  },

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    questionWords: Number(process.env.AI_QUESTION_WORDS || 800),
    landingWords: Number(process.env.AI_LANDING_WORDS || 400),
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  paypal: {
    env: process.env.PAYPAL_ENV || 'sandbox',
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    get apiBase() {
      return this.env === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
    },
  },

  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    // Refuse to send credentials/mail in plaintext when secure is false
    // (e.g. IONOS on port 587, which upgrades via STARTTLS).
    requireTLS: process.env.SMTP_REQUIRE_TLS === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.MAIL_FROM || 'Kno U Kno <knoukno006@gmail.com>',
    retentionYears: Number(process.env.MAIL_RETENTION_YEARS || 2),
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'knoukno006@gmail.com',
    password: process.env.ADMIN_PASSWORD || '',
  },
};
