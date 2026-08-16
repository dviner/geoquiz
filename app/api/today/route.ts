import { NextRequest, NextResponse } from "next/server";
import { todayDateString } from "@/lib/date";
import { getOrAssignDailyQuestion } from "@/lib/dailySelection";
import { toSafeQuestion } from "@/lib/questions";
import { computeStatus, computeResults, getAnswerForPerson, isRevealed } from "@/lib/answers";
import { isValidPersonId } from "@/lib/people";
import { TodayResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  const personId = req.nextUrl.searchParams.get("personId");
  if (!isValidPersonId(personId)) {
    return NextResponse.json({ error: "Invalid or missing personId" }, { status: 400 });
  }

  const date = todayDateString();
  const question = await getOrAssignDailyQuestion(date);
  const status = await computeStatus(date);
  const revealed = await isRevealed(date);
  const mine = await getAnswerForPerson(date, personId);

  const base = {
    date,
    question: toSafeQuestion(question),
    youAnswered: !!mine,
    yourAnswerIndex: mine ? mine.answer_index : null,
    status,
  };

  if (!revealed) {
    const body: TodayResponse = { ...base, revealed: false };
    return NextResponse.json(body);
  }

  const body: TodayResponse = {
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
  return NextResponse.json(body);
}
