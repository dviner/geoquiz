export function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return <span className="text-neutral-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
      🔥 {streak}
    </span>
  );
}
