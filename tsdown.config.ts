import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/{index,run,config}.ts"],
  minify: true,
  publint: true,
});
