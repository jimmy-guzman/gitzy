import { defineConfig } from "tsdown";

export default defineConfig({
  deps: {
    onlyBundle: [
      "ansi-colors",
      "commander",
      "enquirer",
      "valibot",
      "@leeoniya/ufuzzy",
    ],
  },
  entry: ["src/run.ts", "src/api/index.ts"],
  minify: true,
  publint: true,
});
