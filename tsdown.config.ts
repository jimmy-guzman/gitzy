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
    ],
  },
  entry: ["src/run.ts", "src/api/index.ts"],
  minify: true,
  publint: true,
});
