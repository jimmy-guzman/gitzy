import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        branches: 93.33,
        functions: 93.1,
        lines: 96.63,
        statements: 96.67,
      },
    },
    globals: true,
  },
});
