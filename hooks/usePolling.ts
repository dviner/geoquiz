"use client";

import { useEffect, useRef } from "react";

const POLL_INTERVAL_MS = 45_000;

/** Calls `fn` immediately, then on an interval while the tab is visible, pausing when hidden. */
export function usePolling(fn: () => void, deps: React.DependencyList) {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    fnRef.current();

    const interval = setInterval(() => {
      if (!document.hidden) fnRef.current();
    }, POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (!document.hidden) fnRef.current();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
