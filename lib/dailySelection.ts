import { db, ensureSchema } from "./db";
import { getAllQuestions, getQuestionById } from "./questions";
import { Question } from "./types";

const NO_REPEAT_DAYS = 21;

function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

async function getRecentlyUsedIds(beforeDate: string, days: number): Promise<Set<string>> {
  const result = await db.execute({
    sql: `SELECT question_id FROM daily_questions WHERE date < ? ORDER BY date DESC LIMIT ?`,
    args: [beforeDate, days],
  });
  return new Set(result.rows.map((r) => r.question_id as string));
}

async function selectQuestionForDate(date: string): Promise<string> {
  const recent = await getRecentlyUsedIds(date, NO_REPEAT_DAYS);
  const all = getAllQuestions();
  const pool = all.filter((q) => !recent.has(q.id));
  const eligible = pool.length > 0 ? pool : all;
  const seed = djb2Hash(date);
  return eligible[seed % eligible.length].id;
}

/**
 * Assigns (once, ever) and returns the question id for a date. Race-safe: if two requests hit this
 * for the same not-yet-assigned date at once, the unique PRIMARY KEY on `date` means only one INSERT
 * wins — the loser just re-reads whatever the winner wrote, rather than relying on a preceding SELECT
 * to be atomic with the INSERT (which it can't be, across separate network round-trips).
 */
async function assignDailyQuestionId(date: string): Promise<string> {
  await ensureSchema();
  const existing = await db.execute({
    sql: `SELECT question_id FROM daily_questions WHERE date = ?`,
    args: [date],
  });
  if (existing.rows[0]) return existing.rows[0].question_id as string;

  const questionId = await selectQuestionForDate(date);
  await db.execute({
    sql: `INSERT INTO daily_questions (date, question_id, assigned_at)
          VALUES (?, ?, ?)
          ON CONFLICT(date) DO NOTHING`,
    args: [date, questionId, new Date().toISOString()],
  });

  const finalRow = await db.execute({
    sql: `SELECT question_id FROM daily_questions WHERE date = ?`,
    args: [date],
  });
  return finalRow.rows[0].question_id as string;
}

/** Returns today's (or any date's) assigned question, assigning and persisting it on first access. */
export async function getOrAssignDailyQuestion(date: string): Promise<Question> {
  const questionId = await assignDailyQuestionId(date);
  const question = getQuestionById(questionId);
  if (!question) {
    throw new Error(`Assigned question ${questionId} for ${date} no longer exists in the question bank`);
  }
  return question;
}

/** Looks up the question assigned to a date, if any, without assigning one. Used by history. */
export async function getAssignedQuestionForDate(date: string): Promise<Question | undefined> {
  await ensureSchema();
  const result = await db.execute({
    sql: `SELECT question_id FROM daily_questions WHERE date = ?`,
    args: [date],
  });
  const row = result.rows[0];
  if (!row) return undefined;
  return getQuestionById(row.question_id as string);
}

export async function getAllAssignedDates(): Promise<string[]> {
  await ensureSchema();
  const result = await db.execute(`SELECT date FROM daily_questions ORDER BY date DESC`);
  return result.rows.map((r) => r.date as string);
}
