import jimmyDotCodes from "@jimmy.codes/eslint-config";

export default jimmyDotCodes({
  typescript: { project: ["./tsconfig.json", "./e2e/tsconfig.json"] },
});
