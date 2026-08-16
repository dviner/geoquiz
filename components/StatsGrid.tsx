import { PersonStats } from "@/lib/types";
import { StreakBadge } from "./StreakBadge";

export function StatsGrid({ stats }: { stats: PersonStats[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.personId}
          className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p className="text-sm font-semibold">{s.personName}</p>
          <dl className="mt-3 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Accuracy</dt>
              <dd className="font-medium">{s.totalAnswered > 0 ? `${s.accuracyPct}%` : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Current streak</dt>
              <dd>
                <StreakBadge streak={s.currentStreak} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Longest streak</dt>
              <dd>
                <StreakBadge streak={s.longestStreak} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Answered</dt>
              <dd className="font-medium">
                {s.totalCorrect}/{s.totalAnswered}
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
