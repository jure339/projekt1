import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    // (po želji) include samo unit teste:
    // include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
    },
  },
});
