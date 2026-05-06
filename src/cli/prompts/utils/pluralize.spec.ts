import { pluralize } from "./pluralize";

describe("pluralize", () => {
  it("should not add 's' when count is 1", () => {
    expect(pluralize(1, "character")).toBe("1 character");
  });

  it("should add 's' when count is greater than 1", () => {
    expect(pluralize(2, "character")).toBe("2 characters");
  });

  it("should add 's' when count is 0", () => {
    expect(pluralize(0, "character")).toBe("0 characters");
  });

  it("should add 's' when count is negative", () => {
    expect(pluralize(-1, "character")).toBe("-1 characters");
  });

  it("should handle multi-word phrases", () => {
    expect(pluralize(3, "more character")).toBe("3 more characters");
  });

  it("should pluralize the last word in multi-word phrases", () => {
    expect(pluralize(1, "more character")).toBe("1 more character");
  });
});
