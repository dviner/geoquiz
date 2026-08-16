interface TriviaQuestionProps {
  prompt: string;
}

// Flag emoji are pairs of Unicode regional indicator symbols (e.g. 🇯🇵 = U+1F1EF U+1F1F5).
const FLAG_EMOJI_REGEX = /\p{Regional_Indicator}{2}/u;

export function TriviaQuestion({ prompt }: TriviaQuestionProps) {
  const flagEmoji = prompt.match(FLAG_EMOJI_REGEX)?.[0];
  const text = flagEmoji ? prompt.replace(flagEmoji, "").trim() : prompt;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
      {flagEmoji && <div className="mb-4 text-8xl leading-none sm:text-9xl">{flagEmoji}</div>}
      <p className="text-xl font-semibold leading-snug">{text}</p>
    </div>
  );
}
