import { runMigrations } from './migrate.js';

runMigrations()
  .then(() => {
    console.log('Migrations complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
