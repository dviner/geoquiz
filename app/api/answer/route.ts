import { NextRequest, NextResponse } from "next/server";
import { todayDateString } from "@/lib/date";
import { getOrAssignDailyQuestion } from "@/lib/dailySelection";
import { toSafeQuestion } from "@/lib/questions";
import { computeStatus, computeResults, submitAnswer, isRevealed } from "@/lib/answers";
import { isValidPersonId } from "@/lib/people";
import { TodayResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { personId, answerIndex } = (body ?? {}) as { personId?: unknown; answerIndex?: unknown };

  if (!isValidPersonId(personId)) {
    return NextResponse.json({ error: "Invalid or missing personId" }, { status: 400 });
  }
  if (typeof answerIndex !== "number" || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
    return NextResponse.json({ error: "answerIndex must be an integer 0-3" }, { status: 400 });
  }

  const date = todayDateString();
  const question = await getOrAssignDailyQuestion(date);
  const { inserted, row } = await submitAnswer(date, personId, answerIndex, question);

  const status = await computeStatus(date);
  const revealed = await isRevealed(date);

  const base = {
    date,
    question: toSafeQuestion(question),
    youAnswered: true,
    yourAnswerIndex: row.answer_index,
    status,
  };

  const responseStatus = inserted ? 200 : 409;

  if (!revealed) {
    const responseBody: TodayResponse = { ...base, revealed: false };
    return NextResponse.json(responseBody, { status: responseStatus });
  }

  const responseBody: TodayResponse = {
    ...base,
    revealed: true,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    sourceUrl: question.sourceUrl,
    locationCountryIds: question.locationCountryIds,
    locationRegion: question.locationRegion,
    capitalCoordinates: question.capitalCoordinates,
    results: await computeResults(date),
  };
  return NextResponse.json(responseBody, { status: responseStatus });
}
