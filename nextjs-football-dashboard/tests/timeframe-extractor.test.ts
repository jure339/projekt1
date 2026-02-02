import { test, expect } from "@playwright/test";

import { createTimeFrameExtractor } from "../src/utils/timeframe-extractor";

test.describe("timeframe-extractor", () => {
  test("returns matching section from the selected time frame", () => {
    const extract = createTimeFrameExtractor("home:week,away:month,total:year");

    expect(extract("home")).toBe("home:week");
    expect(extract("away")).toBe("away:month");
    expect(extract("total")).toBe("total:year");
  });

  test("returns undefined when no match exists", () => {
    const extract = createTimeFrameExtractor("home:week,away:month");
    expect(extract("total")).toBeUndefined();
  });
});
