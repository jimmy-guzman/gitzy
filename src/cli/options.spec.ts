import { skipOption } from "./options";

describe("options", () => {
  it("should create skip option", () => {
    expect(skipOption).toMatchObject({
      argChoices: ["type", "scope", "subject", "body", "breaking", "issues"],
      long: "--skip",
      short: "-S",
      variadic: true,
    });
  });
});
