import { db, ensureSchema } from "./db";
import { PEOPLE, getPersonById } from "./people";
import { Question, AnswerResult, DailyStatus } from "./types";

interface AnswerRow {
  person_id: string;
  answer_index: number;
  is_correct: number;
  answered_at: string;
}

function rowToAnswer(row: Record<string, unknown>): AnswerRow {
  return {
    person_id: row.person_id as string,
    answer_index: row.answer_index as number,
    is_correct: row.is_correct as number,
    answered_at: row.answered_at as string,
  };
}

export async function getAnswersForDate(date: string): Promise<AnswerRow[]> {
  await ensureSchema();
  const result = await db.execute({
    sql: `SELECT person_id, answer_index, is_correct, answered_at FROM answers WHERE date = ?`,
    args: [date],
  });
  return result.rows.map((r) => rowToAnswer(r as unknown as Record<string, unknown>));
}

export async function getAnswerForPerson(date: string, personId: string): Promise<AnswerRow | undefined> {
  await ensureSchema();
  const result = await db.execute({
    sql: `SELECT person_id, answer_index, is_correct, answered_at FROM answers WHERE date = ? AND person_id = ?`,
    args: [date, personId],
  });
  const row = result.rows[0];
  return row ? rowToAnswer(row as unknown as Record<string, unknown>) : undefined;
}

export async function computeStatus(date: string): Promise<DailyStatus> {
  const answered = new Set((await getAnswersForDate(date)).map((a) => a.person_id));
  const waitingOn = PEOPLE.filter((p) => !answered.has(p.id)).map((p) => p.name);
  return {
    answeredCount: answered.size,
    totalCount: PEOPLE.length,
    waitingOn,
  };
}

export async function isRevealed(date: string): Promise<boolean> {
  return (await computeStatus(date)).answeredCount >= PEOPLE.length;
}

/** Full per-person results for a date, using nulls for anyone who never answered. */
export async function computeResults(date: string): Promise<AnswerResult[]> {
  const rows = await getAnswersForDate(date);
  const byPerson = new Map(rows.map((r) => [r.person_id, r]));
  return PEOPLE.map((p) => {
    const row = byPerson.get(p.id);
    return {
      personId: p.id,
      personName: p.name,
      answerIndex: row ? row.answer_index : null,
      isCorrect: row ? row.is_correct === 1 : false,
    };
  });
}

/**
 * Insert-or-ignore on the (date, person_id) unique constraint, race-safe against concurrent
 * serverless requests (unlike synchronous local SQLite, nothing here guarantees the check-then-insert
 * runs atomically, so the DB constraint — not a prior SELECT — is what prevents a double answer).
 */
export async function submitAnswer(
  date: string,
  personId: string,
  answerIndex: number,
  question: Question
): Promise<{ inserted: boolean; row: AnswerRow }> {
  await ensureSchema();
  const isCorrect = answerIndex === question.correctIndex ? 1 : 0;
  const answeredAt = new Date().toISOString();

  const insertResult = await db.execute({
    sql: `INSERT INTO answers (date, person_id, answer_index, is_correct, answered_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(date, person_id) DO NOTHING`,
    args: [date, personId, answerIndex, isCorrect, answeredAt],
  });

  if (insertResult.rowsAffected > 0) {
    return { inserted: true, row: { person_id: personId, answer_index: answerIndex, is_correct: isCorrect, answered_at: answeredAt } };
  }

  // Someone else's answer won the race (or this is a genuine resubmit) — return what's actually stored.
  const existing = await getAnswerForPerson(date, personId);
  if (!existing) {
    throw new Error(`submitAnswer: insert was ignored but no existing row found for ${date}/${personId}`);
  }
  return { inserted: false, row: existing };
}

export { getPersonById };
