import { PEOPLE } from "./people";
import { getAllAssignedDates } from "./dailySelection";
import { computeResults, isRevealed } from "./answers";
import { todayDateString } from "./date";
import { PersonStats, AnswerResult } from "./types";

export interface EligibleDay {
  date: string;
  results: AnswerResult[];
}

async function getEligibleDaysChronological(): Promise<EligibleDay[]> {
  const today = todayDateString();
  const dates = await getAllAssignedDates(); // desc
  const eligible: EligibleDay[] = [];
  for (const date of dates) {
    if (date === today) {
      if (!(await isRevealed(date))) continue; // today only counts once revealed
    }
    eligible.push({ date, results: await computeResults(date) });
  }
  return eligible.reverse(); // chronological (oldest first)
}

export function computeStatsForPerson(personId: string, personName: string, days: EligibleDay[]): PersonStats {
  let running = 0;
  let longest = 0;
  let correct = 0;
  let answered = 0;

  for (const day of days) {
    const mine = day.results.find((r) => r.personId === personId);
    const didAnswer = mine?.answerIndex !== null && mine?.answerIndex !== undefined;
    if (didAnswer) {
      answered++;
      if (mine!.isCorrect) correct++;
    }
    if (didAnswer && mine!.isCorrect) {
      running++;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  return {
    personId,
    personName,
    totalAnswered: answered,
    totalCorrect: correct,
    accuracyPct: answered > 0 ? Math.round((correct / answered) * 1000) / 10 : 0,
    currentStreak: running,
    longestStreak: longest,
  };
}

export async function getAllPersonStats(): Promise<PersonStats[]> {
  const days = await getEligibleDaysChronological();
  return PEOPLE.map((p) => computeStatsForPerson(p.id, p.name, days));
}
