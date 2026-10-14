import { defineConfig } from "tsdown";

export default defineConfig({
  deps: {
    onlyBundle: [
      "@clack/prompts",
      "@leeoniya/ufuzzy",
      "commander",
      "valibot",
      "@clack/core",
      "fast-string-width",
      "fast-wrap-ansi",
      "sisteransi",
      "fast-string-truncated-width",
      "lilconfig",
      "tinyexec",
    ],
  },
  dts: { entry: "src/index.ts", tsconfig: "tsconfig.build.json" },
  entry: ["src/run.ts", "src/index.ts"],
  minify: true,
  publint: true,
});
