import { describe, it, expect } from "vitest";
import { computeStatsForPerson, EligibleDay } from "../stats";

const PERSON = "dad";

function day(date: string, answerIndex: number | null, isCorrect: boolean): EligibleDay {
  return {
    date,
    results: [{ personId: PERSON, personName: "Dad", answerIndex, isCorrect }],
  };
}

describe("computeStatsForPerson", () => {
  it("builds a running streak across consecutive correct answers", () => {
    const days = [day("2026-01-01", 0, true), day("2026-01-02", 0, true), day("2026-01-03", 0, true)];
    const stats = computeStatsForPerson(PERSON, "Dad", days);
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.accuracyPct).toBe(100);
  });

  it("resets the current streak on a wrong answer but keeps the longest", () => {
    const days = [
      day("2026-01-01", 0, true),
      day("2026-01-02", 0, true),
      day("2026-01-03", 1, false),
      day("2026-01-04", 0, true),
    ];
    const stats = computeStatsForPerson(PERSON, "Dad", days);
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(2);
  });

  it("treats a missed (unanswered) day as breaking the streak, same as a wrong answer", () => {
    const days = [day("2026-01-01", 0, true), day("2026-01-02", null, false), day("2026-01-03", 0, true)];
    const stats = computeStatsForPerson(PERSON, "Dad", days);
    expect(stats.currentStreak).toBe(1);
    expect(stats.totalAnswered).toBe(2); // missed day doesn't count as "answered"
    expect(stats.accuracyPct).toBe(100); // missed day doesn't dilute accuracy, only breaks streak
  });

  it("returns zeroed stats when the person has never answered", () => {
    const days = [day("2026-01-01", null, false)];
    const stats = computeStatsForPerson(PERSON, "Dad", days);
    expect(stats).toMatchObject({
      totalAnswered: 0,
      totalCorrect: 0,
      accuracyPct: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
  });
});
