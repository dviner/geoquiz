"use client";

import { useCallback, useSyncExternalStore } from "react";
import { PEOPLE, getPersonById } from "@/lib/people";

const STORAGE_KEY = "geoquiz.personId";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && PEOPLE.some((p) => p.id === stored) ? stored : null;
}

function getServerSnapshot(): string | null {
  return null;
}

export function usePerson() {
  const personId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setPerson = useCallback((id: string) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new Event("storage"));
  }, []);

  const clearPerson = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("storage"));
  }, []);

  return {
    personId,
    person: personId ? getPersonById(personId) : undefined,
    loaded: true,
    setPerson,
    clearPerson,
  };
}
