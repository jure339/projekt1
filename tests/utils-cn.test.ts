import { test, expect } from "@playwright/test";

import { cn } from "../src/lib/utils";

test.describe("cn", () => {
  test("merges conditional class names", () => {
    expect(cn("p-2", false && "hidden", "text-sm")).toBe("p-2 text-sm");
  });

  test("removes conflicting tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
