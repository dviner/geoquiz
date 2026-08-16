import { todayDateString } from "./date";
import { getAllAssignedDates, getAssignedQuestionForDate } from "./dailySelection";
import { toSafeQuestion } from "./questions";
import { computeStatus, computeResults, isRevealed } from "./answers";
import { HistoryDay } from "./types";

/** All assigned days, most recent first. Today is gated by the reveal lock; past days are always full. */
export async function buildHistoryDays(): Promise<HistoryDay[]> {
  const today = todayDateString();
  const dates = await getAllAssignedDates();

  const days: HistoryDay[] = [];
  for (const date of dates) {
    const question = await getAssignedQuestionForDate(date);
    if (!question) continue; // question removed from bank since assignment

    const status = await computeStatus(date);
    const isToday = date === today;
    const revealed = isToday ? await isRevealed(date) : true;

    days.push(
      revealed
        ? {
            date,
            question: toSafeQuestion(question),
            revealed: true,
            correctIndex: question.correctIndex,
            explanation: question.explanation,
            sourceUrl: question.sourceUrl,
            locationCountryIds: question.locationCountryIds,
            locationRegion: question.locationRegion,
            capitalCoordinates: question.capitalCoordinates,
            results: await computeResults(date),
            status,
          }
        : {
            date,
            question: toSafeQuestion(question),
            revealed: false,
            correctIndex: null,
            explanation: null,
            sourceUrl: null,
            results: [],
            status,
          }
    );
  }
  return days;
}
