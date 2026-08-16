import { Person } from "./types";

// Fixed list of the 4 family members. Rename freely — history is keyed by `id`, not `name`.
export const PEOPLE: readonly Person[] = [
  { id: "dad", name: "Papa" },
  { id: "mom", name: "Mama" },
  { id: "daughter20", name: "Aurelia" },
  { id: "daughter16", name: "Andie" },
];

export function getPersonById(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

export function isValidPersonId(id: unknown): id is string {
  return typeof id === "string" && PEOPLE.some((p) => p.id === id);
}
