import { pool, query } from './pool.js';
import { generateQuestion } from '../services/openai.js';

/** Fills in examples for questions that were written while the example was missing. */
async function run() {
  const rows = await query(
    `SELECT q.id, q.stage, q.position, t.business_title, t.location
       FROM questions q JOIN titles t ON t.id = q.title_id
      WHERE q.example IS NULL OR q.example = ''`,
  );

  for (const row of rows) {
    const { example } = await generateQuestion({
      business: { business_title: row.business_title, location: row.location },
      position: row.position,
      total: 4,
    });
    await query('UPDATE questions SET example = :example WHERE id = :id', {
      example,
      id: row.id,
    });
  }

  console.log(`Backfilled ${rows.length} examples.`);
  await pool.end();
}

run().catch((err) => {
  console.error('Backfill failed:', err.message);
  process.exit(1);
});
