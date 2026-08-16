export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS daily_questions (
  date TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL REFERENCES daily_questions(date),
  person_id TEXT NOT NULL,
  answer_index INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,
  answered_at TEXT NOT NULL,
  UNIQUE(date, person_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_date ON answers(date);
`;
