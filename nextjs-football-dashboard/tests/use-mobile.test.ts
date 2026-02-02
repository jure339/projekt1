import { test, expect } from "@playwright/test";
import { render, screen, act, cleanup } from "./_support/test-utils";
import React from "react";

import { MOBILE_BREAKPOINT, useIsMobile } from "../src/hooks/use-mobile";

type Listener = (event: Event) => void;

const listeners = new Set<Listener>();

function setupMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: (_: string, cb: Listener) => listeners.add(cb),
      removeEventListener: (_: string, cb: Listener) => listeners.delete(cb),
      dispatchEvent: (event: Event) => {
        listeners.forEach((cb) => cb(event));
        return true;
      },
    }),
  });
}

function setWidth(width: number) {
  (window as Window & { innerWidth: number }).innerWidth = width;
  const event = new Event("change");
  listeners.forEach((cb) => cb(event));
}

function TestComponent() {
  const isMobile = useIsMobile();
  return React.createElement(
    "div",
    { "data-testid": "value" },
    isMobile ? "mobile" : "desktop",
  );
}

test.describe("use-is-mobile", () => {
  test.afterEach(() => {
    cleanup();
  });

  test("returns true when below breakpoint and updates on resize", () => {
    setupMatchMedia();
    setWidth(MOBILE_BREAKPOINT - 100);

    render(React.createElement(TestComponent));
    expect(screen.getByTestId("value").textContent).toBe("mobile");

    act(() => {
      setWidth(MOBILE_BREAKPOINT + 100);
    });
    expect(screen.getByTestId("value").textContent).toBe("desktop");
  });
});
