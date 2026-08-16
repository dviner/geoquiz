"use client";

import { PEOPLE } from "@/lib/people";
import { usePersonContext } from "./PersonProvider";

export function PersonPicker() {
  const { setPerson } = usePersonContext();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">🌍 Family Geography Quiz</h1>
        <p className="mt-2 text-sm text-neutral-500">Who&apos;s playing?</p>
      </div>
      <div className="grid w-full max-w-xs grid-cols-1 gap-3 sm:max-w-sm sm:grid-cols-2">
        {PEOPLE.map((p) => (
          <button
            key={p.id}
            onClick={() => setPerson(p.id)}
            className="rounded-xl border border-neutral-300 bg-white px-6 py-4 text-lg font-medium shadow-sm transition hover:border-blue-500 hover:bg-blue-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
