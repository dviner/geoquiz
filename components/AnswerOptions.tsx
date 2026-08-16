"use client";

interface AnswerOptionsProps {
  options: readonly string[];
  disabled?: boolean;
  selectedIndex?: number | null;
  correctIndex?: number | null;
  onSelect?: (index: number) => void;
}

export function AnswerOptions({
  options,
  disabled = false,
  selectedIndex = null,
  correctIndex = null,
  onSelect,
}: AnswerOptionsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrectAnswer = correctIndex !== null && correctIndex === index;
        const showResult = correctIndex !== null;

        let classes =
          "w-full min-h-[44px] rounded-xl border px-4 py-3 text-left text-base font-medium transition active:scale-[0.99]";

        if (showResult) {
          if (isCorrectAnswer) {
            classes += " border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100";
          } else if (isSelected) {
            classes += " border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100";
          } else {
            classes += " border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-500";
          }
        } else if (isSelected) {
          classes += " border-blue-500 bg-blue-50 dark:bg-blue-950";
        } else {
          classes +=
            " border-neutral-300 bg-white hover:border-blue-400 hover:bg-blue-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800";
        }

        return (
          <button
            key={index}
            disabled={disabled}
            onClick={() => onSelect?.(index)}
            className={classes + (disabled && !showResult ? " opacity-60" : "")}
          >
            {option}
            {showResult && isCorrectAnswer && " ✓"}
            {showResult && isSelected && !isCorrectAnswer && " ✗"}
          </button>
        );
      })}
    </div>
  );
}
