import rateLimit from 'express-rate-limit';

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down and try again shortly.' },
};

export const apiLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 600 });

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

export const forgotLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { error: 'Too many password reset requests. Try again in an hour.' },
});

// AI generation is the expensive path — keep it tight.
export const aiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: { error: 'Question generation limit reached for this hour.' },
});
