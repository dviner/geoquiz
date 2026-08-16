import { NextRequest, NextResponse } from "next/server";
import { getQuestionById } from "@/lib/questions";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { questionId, answerIndex } = (body ?? {}) as { questionId?: unknown; answerIndex?: unknown };

  if (typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }
  if (typeof answerIndex !== "number" || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
    return NextResponse.json({ error: "answerIndex must be an integer 0-3" }, { status: 400 });
  }

  const question = getQuestionById(questionId);
  if (!question) {
    return NextResponse.json({ error: "Unknown questionId" }, { status: 404 });
  }

  return NextResponse.json({
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    sourceUrl: question.sourceUrl,
    locationCountryIds: question.locationCountryIds,
    locationRegion: question.locationRegion,
    capitalCoordinates: question.capitalCoordinates,
    isCorrect: answerIndex === question.correctIndex,
  });
}
