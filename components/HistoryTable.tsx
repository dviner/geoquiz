"use client";

import { useState } from "react";
import { HistoryDay } from "@/lib/types";
import { MapQuestion } from "./MapQuestion";

function DayDetail({ day }: { day: HistoryDay }) {
  if (!day.revealed) {
    return (
      <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-500 dark:bg-neutral-800">
        {day.status.answeredCount} of {day.status.totalCount} answered — waiting on{" "}
        {day.status.waitingOn.join(", ")}.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-neutral-500">{day.question.prompt}</p>
      <ul className="flex flex-col gap-1">
        {day.results.map((r) => (
          <li key={r.personId} className="flex justify-between text-sm">
            <span>{r.personName}</span>
            <span className={r.isCorrect ? "text-green-600" : "text-red-500"}>
              {r.answerIndex === null
                ? "No answer"
                : `${day.question.options[r.answerIndex]}${r.isCorrect ? " ✓" : " ✗"}`}
            </span>
          </li>
        ))}
      </ul>
      {day.correctIndex !== null && (
        <p className="mt-1 text-sm">
          <span className="font-semibold">Correct answer: </span>
          {day.question.options[day.correctIndex]}
        </p>
      )}
      {day.explanation && (
        <p className="text-xs text-neutral-500">
          {day.explanation}
          {day.sourceUrl && (
            <a
              href={day.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Learn more →
            </a>
          )}
        </p>
      )}
      {day.question.type === "trivia" && day.locationCountryIds && day.locationCountryIds.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Where it is</p>
          <MapQuestion
            countryIds={day.locationCountryIds}
            region={day.locationRegion}
            markerCoordinates={day.capitalCoordinates}
          />
        </div>
      )}
    </div>
  );
}

export function HistoryTable({ days }: { days: HistoryDay[] }) {
  const [expanded, setExpanded] = useState<string | null>(days[0]?.date ?? null);

  if (days.length === 0) {
    return <p className="text-sm text-neutral-500">No questions yet — check back after the first day.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
      {days.map((day) => {
        const isOpen = expanded === day.date;
        const correctCount = day.results.filter((r) => r.isCorrect).length;
        return (
          <div key={day.date} className="bg-white dark:bg-neutral-900">
            <button
              onClick={() => setExpanded(isOpen ? null : day.date)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold">{day.date}</p>
                <p className="text-xs text-neutral-500">
                  {day.question.category} · {day.question.difficulty}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                {day.revealed ? (
                  <span>{correctCount}/4 correct</span>
                ) : (
                  <span>{day.status.answeredCount}/4 answered</span>
                )}
                <span>{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <DayDetail day={day} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
