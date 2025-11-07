import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        branches: 94.4,
        functions: 93.58,
        lines: 96.72,
        statements: 96.84,
      },
    },
    globals: true,
  },
});
