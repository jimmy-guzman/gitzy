import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        "**/{interfaces,types,index}.ts",
        "knip.config.ts",
      ],
      reporter: ["text", "html", "clover", "json", "lcovonly"],
      thresholds: {
        branches: 95,
        functions: 94,
        lines: 95,
        statements: 95,
      },
    },
    exclude: [...configDefaults.exclude],
    globals: true,
  },
});
