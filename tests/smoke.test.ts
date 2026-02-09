import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("playwright runs", () => {
    expect(true).toBe(true);
  });
});
