import { test, expect } from "@playwright/test";

import { compactFormat, standardFormat } from "../src/lib/format-number";

test.describe("format-number", () => {
  test("formats compact numbers", () => {
    expect(compactFormat(1200)).toBe("1.2K");
  });

  test("formats standard numbers with 2 decimals", () => {
    expect(standardFormat(1234)).toBe("1,234.00");
  });
});
