import { test, expect } from "@playwright/test";

import { formatMessageTime } from "../src/lib/format-message-time";

test.describe("format-message-time", () => {
  test("returns relative minutes for messages from today", () => {
    const now = new Date("2026-02-02T12:00:00Z");
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatMessageTime(fiveMinutesAgo.toISOString(), now)).toBe("5m");
  });

  test("returns time for messages from today older than an hour", () => {
    const now = new Date("2026-02-02T12:00:00Z");
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const result = formatMessageTime(twoHoursAgo.toISOString(), now);
    expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });

  test("returns weekday for messages within a week", () => {
    const now = new Date("2026-02-07T12:00:00Z");
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const expected = twoDaysAgo.toLocaleDateString("en-US", {
      weekday: "long",
    });
    expect(formatMessageTime(twoDaysAgo.toISOString(), now)).toBe(expected);
  });

  test("returns month/day for messages in the same year", () => {
    const now = new Date("2026-12-15T12:00:00Z");
    const inMarch = new Date("2026-03-10T12:00:00Z");
    const expected = inMarch.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    expect(formatMessageTime(inMarch.toISOString(), now)).toBe(expected);
  });

  test("returns full date for messages in past years", () => {
    const now = new Date("2026-02-02T12:00:00Z");
    const old = new Date("2023-03-10T12:00:00Z");
    const expected = old.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    expect(formatMessageTime(old.toISOString(), now)).toBe(expected);
  });
});
