import { Question, SafeQuestion } from "./types";
import rawQuestions from "@/data/questions.json";

const QUESTIONS: Question[] = rawQuestions as Question[];

const byId = new Map<string, Question>(QUESTIONS.map((q) => [q.id, q]));

export function getAllQuestions(): Question[] {
  return QUESTIONS;
}

export function getQuestionById(id: string): Question | undefined {
  return byId.get(id);
}

/** A random question, avoiding `excludeIds` where possible (falls back to the full bank if that empties the pool). */
export function getRandomQuestion(excludeIds: Set<string>): Question {
  const pool = QUESTIONS.filter((q) => !excludeIds.has(q.id));
  const eligible = pool.length > 0 ? pool : QUESTIONS;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export function toSafeQuestion(q: Question): SafeQuestion {
  const {
    correctIndex: _correctIndex,
    explanation: _explanation,
    sourceUrl: _sourceUrl,
    locationCountryIds: _locationCountryIds,
    locationRegion: _locationRegion,
    capitalCoordinates: _capitalCoordinates,
    ...safe
  } = q;
  void _correctIndex;
  void _explanation;
  void _sourceUrl;
  void _locationCountryIds;
  void _locationRegion;
  void _capitalCoordinates;
  return safe;
}
