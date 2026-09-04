import { pool } from './pool.js';
import { runMigrations } from './migrate.js';

runMigrations()
  .then(() => {
    console.log('Migrations complete.');
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
