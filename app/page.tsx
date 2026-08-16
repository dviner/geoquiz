"use client";

import { useCallback, useRef, useState } from "react";
import { usePersonContext } from "@/components/PersonProvider";
import { PersonPicker } from "@/components/PersonPicker";
import { QuestionCard } from "@/components/QuestionCard";
import { WaitingStatus } from "@/components/WaitingStatus";
import { RevealPanel } from "@/components/RevealPanel";
import { CelebrationBanner } from "@/components/CelebrationBanner";
import { usePolling } from "@/hooks/usePolling";
import { TodayResponse, PersonStats } from "@/lib/types";

export default function TodayPage() {
  const { personId, loaded } = usePersonContext();
  const [data, setData] = useState<TodayResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myStreak, setMyStreak] = useState<number | null>(null);
  const streakFetchedRef = useRef(false);

  const fetchMyStreak = useCallback(async (currentPersonId: string) => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) return;
      const json: { stats: PersonStats[] } = await res.json();
      const mine = json.stats.find((s) => s.personId === currentPersonId);
      if (mine) setMyStreak(mine.currentStreak);
    } catch {
      // ignore — celebration banner just omits the streak count
    }
  }, []);

  const fetchToday = useCallback(async () => {
    if (!personId) return;
    try {
      const res = await fetch(`/api/today?personId=${encodeURIComponent(personId)}`);
      if (!res.ok) return;
      const json: TodayResponse = await res.json();
      setData(json);
      if (json.revealed && !streakFetchedRef.current) {
        streakFetchedRef.current = true;
        fetchMyStreak(personId);
      }
    } catch {
      // silent — will retry on next poll tick
    }
  }, [personId, fetchMyStreak]);

  usePolling(fetchToday, [personId]);

  const handleSelect = async (index: number) => {
    if (!personId || submitting || data?.youAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, answerIndex: index }),
      });
      const json: TodayResponse = await res.json();
      if (res.ok || res.status === 409) {
        setData(json);
        if (json.revealed && !streakFetchedRef.current) {
          streakFetchedRef.current = true;
          fetchMyStreak(personId);
        }
      } else {
        setError("Something went wrong submitting your answer. Try again.");
      }
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded) return null;
  if (!personId) return <PersonPicker />;
  if (!data) return <p className="py-12 text-center text-neutral-400">Loading today&apos;s question…</p>;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-center text-lg font-semibold text-neutral-500">{data.date}</h1>

      {!data.revealed && !data.youAnswered && (
        <QuestionCard question={data.question} onSelect={handleSelect} disabled={submitting} />
      )}

      {!data.revealed && data.youAnswered && (
        <>
          <QuestionCard
            question={data.question}
            disabled
            selectedIndex={data.yourAnswerIndex}
            correctIndex={null}
          />
          <WaitingStatus status={data.status} />
        </>
      )}

      {data.revealed && (
        <>
          <QuestionCard
            question={data.question}
            disabled
            selectedIndex={data.yourAnswerIndex}
            correctIndex={data.correctIndex}
            locationCountryIds={data.locationCountryIds}
            locationRegion={data.locationRegion}
            capitalCoordinates={data.capitalCoordinates}
          />
          {data.yourAnswerIndex !== null && (
            <CelebrationBanner
              correct={data.yourAnswerIndex === data.correctIndex}
              streak={myStreak ?? undefined}
            />
          )}
          <RevealPanel
            results={data.results}
            explanation={data.explanation}
            sourceUrl={data.sourceUrl}
            currentPersonId={personId}
          />
        </>
      )}

      {error && <p className="text-center text-sm text-red-500">{error}</p>}
    </div>
  );
}
