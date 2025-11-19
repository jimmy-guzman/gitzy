import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        branches: 91.17,
        functions: 92.4,
        lines: 95.42,
        statements: 95.59,
      },
    },
    globals: true,
  },
});