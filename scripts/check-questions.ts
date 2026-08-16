import questions from "../data/questions.json";
import { Question } from "../lib/types";

const DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const REGIONS = new Set(["europe", "africa", "asia", "north-america", "south-america", "oceania"]);
const errors: string[] = [];

const list = questions as Question[];

if (list.length < 100) {
  errors.push(`Expected at least 100 questions, found ${list.length}`);
}

const ids = new Set<string>();
for (const q of list) {
  if (ids.has(q.id)) errors.push(`Duplicate id: ${q.id}`);
  ids.add(q.id);

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`${q.id}: must have exactly 4 options`);
  }
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
    errors.push(`${q.id}: correctIndex must be 0-3`);
  }
  if (!DIFFICULTIES.has(q.difficulty)) {
    errors.push(`${q.id}: invalid difficulty "${q.difficulty}"`);
  }
  if (!q.explanation || q.explanation.trim().length === 0) {
    errors.push(`${q.id}: missing explanation`);
  }
  if (!q.sourceUrl || !/^https:\/\//.test(q.sourceUrl)) {
    errors.push(`${q.id}: missing or invalid sourceUrl "${q.sourceUrl}"`);
  }
  if (!q.prompt || q.prompt.trim().length === 0) {
    errors.push(`${q.id}: missing prompt`);
  }
  if (q.type === "map") {
    if (!q.countryId || !/^\d{1,3}$/.test(q.countryId)) {
      errors.push(`${q.id}: map question has invalid countryId "${q.countryId}"`);
    }
    // "world" is always available as the first map tab, so a per-question region must be a
    // real continent (or omitted) — never "world" itself, which would just duplicate that tab.
    if (q.region !== undefined && !REGIONS.has(q.region)) {
      errors.push(`${q.id}: invalid region "${q.region}"`);
    }
  } else if ((q.type as string) !== "trivia") {
    const loose = q as unknown as { id: string; type: string };
    errors.push(`${loose.id}: unknown type "${loose.type}"`);
  }

  if (q.locationCountryIds !== undefined) {
    if (!Array.isArray(q.locationCountryIds) || q.locationCountryIds.length === 0) {
      errors.push(`${q.id}: locationCountryIds must be a non-empty array when present`);
    } else if (q.locationCountryIds.some((id) => !/^\d{1,3}$/.test(id))) {
      errors.push(`${q.id}: locationCountryIds has an invalid id in [${q.locationCountryIds.join(", ")}]`);
    }
  }
  if (q.locationRegion !== undefined && !REGIONS.has(q.locationRegion)) {
    errors.push(`${q.id}: invalid locationRegion "${q.locationRegion}"`);
  }
  if (q.capitalCoordinates !== undefined) {
    const [lon, lat] = q.capitalCoordinates;
    if (
      !Array.isArray(q.capitalCoordinates) ||
      q.capitalCoordinates.length !== 2 ||
      typeof lon !== "number" ||
      typeof lat !== "number" ||
      lon < -180 ||
      lon > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      errors.push(`${q.id}: invalid capitalCoordinates ${JSON.stringify(q.capitalCoordinates)}`);
    }
  }
  if (q.category === "capitals" && q.capitalCoordinates === undefined) {
    errors.push(`${q.id}: capitals question is missing capitalCoordinates`);
  }
}

const mapCount = list.filter((q) => q.type === "map").length;
const triviaCount = list.filter((q) => q.type === "trivia").length;

console.log(`Checked ${list.length} questions (${mapCount} map, ${triviaCount} trivia).`);

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s) found:`);
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

console.log("All checks passed.");
