import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        branches: 93.25,
        functions: 93.33,
        lines: 96.65,
        statements: 96.69,
      },
    },
    globals: true,
  },
});