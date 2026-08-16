export const APP_TIMEZONE = "America/Los_Angeles";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Formats an arbitrary instant as YYYY-MM-DD in the app's fixed timezone. Exported mainly for testing. */
export function formatDateInAppTimezone(date: Date): string {
  return formatter.format(date);
}

/** Today's date as YYYY-MM-DD in the app's fixed timezone. This is the single source of truth for "today". */
export function todayDateString(): string {
  return formatDateInAppTimezone(new Date());
}

export function isBeforeDate(a: string, b: string): boolean {
  return a < b;
}
