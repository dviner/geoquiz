import { describe, it, expect } from "vitest";
import { formatDateInAppTimezone } from "../date";

describe("formatDateInAppTimezone (America/Los_Angeles)", () => {
  it("rolls over at midnight Pacific, not midnight UTC", () => {
    // 2026-01-15T07:59:00Z = 2026-01-14T23:59:00 PST (UTC-8, well outside DST)
    expect(formatDateInAppTimezone(new Date("2026-01-15T07:59:00Z"))).toBe("2026-01-14");
    // 2026-01-15T08:00:00Z = 2026-01-15T00:00:00 PST
    expect(formatDateInAppTimezone(new Date("2026-01-15T08:00:00Z"))).toBe("2026-01-15");
  });

  it("accounts for Pacific Daylight Time (UTC-7) after the spring-forward", () => {
    // 2026-07-04T06:59:00Z = 2026-07-03T23:59:00 PDT (UTC-7)
    expect(formatDateInAppTimezone(new Date("2026-07-04T06:59:00Z"))).toBe("2026-07-03");
    // 2026-07-04T07:00:00Z = 2026-07-04T00:00:00 PDT
    expect(formatDateInAppTimezone(new Date("2026-07-04T07:00:00Z"))).toBe("2026-07-04");
  });
});
