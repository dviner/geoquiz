"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { Region, SafeQuestion } from "@/lib/types";

interface CheckResult {
  correctIndex: number;
  explanation: string;
  sourceUrl: string;
  isCorrect: boolean;
  locationCountryIds?: string[];
  locationRegion?: Region;
  capitalCoordinates?: [number, number];
}

export default function PracticePage() {
  const [question, setQuestion] = useState<SafeQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tally, setTally] = useState({ answered: 0, correct: 0 });
  const seenIds = useRef<string[]>([]);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedIndex(null);
    setResult(null);
    try {
      const res = await fetch(`/api/practice?exclude=${encodeURIComponent(seenIds.current.join(","))}`);
      if (!res.ok) throw new Error("bad response");
      const json: { question: SafeQuestion } = await res.json();
      seenIds.current = [...seenIds.current, json.question.id].slice(-20); // cap so it stays a short query string
      setQuestion(json.question);
    } catch {
      setError("Couldn't load a question. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount — not state derived from props/state, so the usual "don't setState
    // in an effect" rationale doesn't apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuestion();
  }, [fetchQuestion]);

  const handleSelect = async (index: number) => {
    if (!question || result) return;
    setSelectedIndex(index);
    try {
      const res = await fetch("/api/practice/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answerIndex: index }),
      });
      if (!res.ok) throw new Error("bad response");
      const json: CheckResult = await res.json();
      setResult(json);
      setTally((t) => ({ answered: t.answered + 1, correct: t.correct + (json.isCorrect ? 1 : 0) }));
    } catch {
      setError("Couldn't check your answer. Try again.");
      setSelectedIndex(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-lg font-semibold">🧭 Explore more questions</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Practice on your own, any time — doesn&apos;t affect the daily quiz or anyone&apos;s stats.
        </p>
        {tally.answered > 0 && (
          <p className="mt-1 text-xs text-neutral-400">
            This session: {tally.correct}/{tally.answered} correct
          </p>
        )}
      </div>

      {question && (
        <QuestionCard
          question={question}
          disabled={selectedIndex !== null}
          selectedIndex={selectedIndex}
          correctIndex={result?.correctIndex ?? null}
          onSelect={handleSelect}
          locationCountryIds={result?.locationCountryIds}
          locationRegion={result?.locationRegion}
          capitalCoordinates={result?.capitalCoordinates}
        />
      )}

      {result && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900 dark:bg-blue-950">
          <span className="font-semibold">{result.isCorrect ? "Correct! " : "Not quite. "}</span>
          {result.explanation}
          <a
            href={result.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
          >
            Learn more →
          </a>
        </div>
      )}

      {result && (
        <button
          onClick={fetchQuestion}
          className="rounded-xl bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
        >
          Next question →
        </button>
      )}

      {loading && !question && <p className="py-12 text-center text-neutral-400">Loading a question…</p>}
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
    </div>
  );
}
