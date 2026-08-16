"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePersonContext } from "./PersonProvider";

export function NavBar() {
  const pathname = usePathname();
  const { person, clearPerson, loaded } = usePersonContext();

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      pathname === href
        ? "bg-blue-600 text-white"
        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    }`;

  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">🌍 GeoQuiz</span>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" className={linkClass("/")}>
          Today
        </Link>
        <Link href="/practice" className={linkClass("/practice")}>
          Practice
        </Link>
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>
        {loaded && person && (
          <button
            onClick={clearPerson}
            className="ml-2 text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            {person.name} · switch
          </button>
        )}
      </div>
    </nav>
  );
}
