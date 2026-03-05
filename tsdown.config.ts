import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/run.ts", "src/api/index.ts"],
  inlineOnly: [
    "ansi-colors",
    "commander",
    "enquirer",
    "valibot",
    "@leeoniya/ufuzzy",
  ],
  minify: true,
  publint: true,
});
