import { config } from '../config/env.js';
import { HttpError } from '../lib/errors.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err instanceof HttpError ? err.status : err.status || 500;

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  }

  const body = {
    error: status >= 500 && config.isProd ? 'Something went wrong on our end.' : err.message,
  };
  if (err.details) body.details = err.details;
  if (!config.isProd && status >= 500) body.stack = err.stack;

  res.status(status).json(body);
}
