import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/run.ts",
  inlineOnly: [
    "commander",
    "ansi-colors",
    "enquirer",
    "valibot",
    "@leeoniya/ufuzzy",
    "yaml",
  ],
  minify: true,
  publint: true,
});
