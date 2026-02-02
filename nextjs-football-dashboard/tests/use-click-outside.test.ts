import { test, expect } from "@playwright/test";
import { render, fireEvent, cleanup } from "./_support/test-utils";
import React from "react";

import { useClickOutside } from "../src/hooks/use-click-outside";

function TestComponent({ onOutside }: { onOutside: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(onOutside);
  return React.createElement(
    "div",
    null,
    React.createElement("div", { "data-testid": "inside", ref }, "inside"),
    React.createElement("div", { "data-testid": "outside" }, "outside"),
  );
}

test.describe("use-click-outside", () => {
  test.afterEach(() => {
    cleanup();
  });

  test("calls callback when clicking outside", () => {
    let called = 0;
    const onOutside = () => {
      called += 1;
    };
    const { getByTestId } = render(React.createElement(TestComponent, { onOutside }));

    fireEvent.mouseDown(getByTestId("outside"));
    expect(called).toBe(1);
  });

  test("does not call callback when clicking inside", () => {
    let called = 0;
    const onOutside = () => {
      called += 1;
    };
    const { getByTestId } = render(React.createElement(TestComponent, { onOutside }));

    fireEvent.mouseDown(getByTestId("inside"));
    expect(called).toBe(0);
  });
});
