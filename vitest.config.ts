import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        branches: 94.73,
        functions: 94.95,
        lines: 97.08,
        statements: 97.1,
      },
    },
    globals: true,
  },
});
