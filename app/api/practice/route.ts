import { NextRequest, NextResponse } from "next/server";
import { getRandomQuestion, toSafeQuestion } from "@/lib/questions";
import { getAssignedQuestionForDate } from "@/lib/dailySelection";
import { todayDateString } from "@/lib/date";

export async function GET(req: NextRequest) {
  const excludeParam = req.nextUrl.searchParams.get("exclude") || "";
  const exclude = new Set(excludeParam.split(",").filter(Boolean));

  // Never surface today's shared question here — that would spoil it ahead of the group reveal.
  const todaysQuestion = await getAssignedQuestionForDate(todayDateString());
  if (todaysQuestion) exclude.add(todaysQuestion.id);

  const question = getRandomQuestion(exclude);
  return NextResponse.json({ question: toSafeQuestion(question) });
}
