"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePerson } from "@/hooks/usePerson";
import { Person } from "@/lib/types";

interface PersonContextValue {
  personId: string | null;
  person: Person | undefined;
  loaded: boolean;
  setPerson: (id: string) => void;
  clearPerson: () => void;
}

const PersonContext = createContext<PersonContextValue | null>(null);

export function PersonProvider({ children }: { children: ReactNode }) {
  const value = usePerson();
  return <PersonContext.Provider value={value}>{children}</PersonContext.Provider>;
}

export function usePersonContext(): PersonContextValue {
  const ctx = useContext(PersonContext);
  if (!ctx) throw new Error("usePersonContext must be used within a PersonProvider");
  return ctx;
}
