import jimmyDotCodes from "@jimmy.codes/eslint-config";

export default jimmyDotCodes(
  {
    typescript: { project: ["./tsconfig.json", "./e2e/tsconfig.json"] },
  },
  {
    files: [`**/*.test.?([cm])[jt]s?(x)`],
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
);
