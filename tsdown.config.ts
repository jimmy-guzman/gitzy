import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  fixedExtension: true,
  minify: true,
  publint: true,
});
