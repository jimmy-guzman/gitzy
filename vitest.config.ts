import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        branches: 93.16,
        functions: 92.59,
        lines: 96.52,
        statements: 96.59,
      },
    },
    globals: true,
  },
});
