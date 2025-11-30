import Database from 'better-sqlite3';

const db = new Database(process.env.DB_FILE || 'data.sqlite');

// answers + questions
db.exec(`
CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  question_id INTEGER NOT NULL,
  rating INTEGER,
  text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_answers_qid ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_text ON questions(text);
`);

export default db;
