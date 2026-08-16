import { AnswerResult } from "@/lib/types";

interface RevealPanelProps {
  results: AnswerResult[];
  explanation: string;
  sourceUrl: string;
  currentPersonId?: string;
}

export function RevealPanel({ results, explanation, sourceUrl, currentPersonId }: RevealPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Everyone&apos;s answers
        </h3>
        <ul className="flex flex-col gap-2">
          {results.map((r) => (
            <li
              key={r.personId}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                r.personId === currentPersonId ? "bg-blue-50 dark:bg-blue-950" : "bg-neutral-50 dark:bg-neutral-800"
              }`}
            >
              <span className="font-medium">{r.personName}</span>
              <span className={r.isCorrect ? "text-green-600" : "text-red-500"}>
                {r.answerIndex === null ? "No answer" : r.isCorrect ? "Correct ✓" : "Incorrect ✗"}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900 dark:bg-blue-950">
        <span className="font-semibold">Fun fact: </span>
        {explanation}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
        >
          Learn more →
        </a>
      </div>
    </div>
  );
}
