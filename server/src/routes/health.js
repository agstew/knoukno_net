import { Router } from 'express';
import { config } from '../config/env.js';
import { ping } from '../db/pool.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    let ok = false;
    let message = 'GoDaddy MySQL is not reachable.';
    try {
      ok = await ping();
      message = `GoDaddy MySQL is connected for ${config.domain}.`;
    } catch (err) {
      message = `GoDaddy MySQL is not reachable: ${err.code || err.message}`;
    }

    res.status(ok ? 200 : 503).json({
      ok,
      database: 'godaddy-mysql',
      domain: config.domain,
      message,
      env: config.env,
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }),
);

export default router;
