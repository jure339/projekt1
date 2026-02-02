import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
});

const { window } = dom;

globalThis.window = window as unknown as Window & typeof globalThis;
globalThis.document = window.document;
Object.defineProperty(globalThis, "navigator", {
  value: window.navigator,
  configurable: true,
});
globalThis.HTMLElement = window.HTMLElement;
globalThis.Event = window.Event;
globalThis.MouseEvent = window.MouseEvent;
globalThis.KeyboardEvent = window.KeyboardEvent;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.localStorage = window.localStorage;
globalThis.requestAnimationFrame =
  window.requestAnimationFrame?.bind(window) ??
  ((callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 16) as unknown as number);
globalThis.cancelAnimationFrame =
  window.cancelAnimationFrame?.bind(window) ??
  ((id: number) => clearTimeout(id));
