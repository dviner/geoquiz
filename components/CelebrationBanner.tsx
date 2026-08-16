interface CelebrationBannerProps {
  correct: boolean;
  streak?: number;
}

export function CelebrationBanner({ correct, streak }: CelebrationBannerProps) {
  if (!correct) {
    return (
      <div className="rounded-xl bg-neutral-100 p-4 text-center text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        Not quite this time — check the explanation below.
      </div>
    );
  }

  const streakMsg = streak && streak >= 2 ? ` 🔥 ${streak}-day streak!` : "";

  return (
    <div className="animate-bounce-once rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 p-4 text-center text-base font-bold text-white shadow-md">
      🎉 Correct!{streakMsg}
    </div>
  );
}
