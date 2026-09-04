import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { pool } from './pool.js';
import { config } from '../config/env.js';
import { quotaFor } from '../config/tiers.js';

const here = path.dirname(fileURLToPath(import.meta.url));

function splitStatements(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function runMigrations() {
  const sql = await fs.readFile(path.join(here, 'schema.sql'), 'utf8');
  const statements = splitStatements(sql);

  const conn = await pool.getConnection();
  try {
    for (const statement of statements) {
      await conn.query(statement);
    }
    console.log(`Applied ${statements.length} schema statements to ${config.db.database}.`);

    if (config.admin.password) {
      const [rows] = await conn.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [
        config.admin.email,
      ]);
      if (!rows.length) {
        const hash = await bcrypt.hash(config.admin.password, config.bcryptRounds);
        await conn.execute(
          `INSERT INTO users (id, email, password_hash, first_name, role, tier, question_quota, email_verified)
           VALUES (?, ?, ?, ?, 'admin', 'pro', ?, 1)`,
          [uuid(), config.admin.email, hash, 'Admin', quotaFor('pro', true)],
        );
        console.log(`Seeded admin user ${config.admin.email}.`);
      }
    } else {
      console.warn('ADMIN_PASSWORD not set — skipping admin bootstrap.');
    }
  } finally {
    conn.release();
  }
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  runMigrations()
    .catch((err) => {
      console.error('Migration failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

export { runMigrations };
