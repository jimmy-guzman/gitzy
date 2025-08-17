import { cleanObject } from "./cleanObject";

describe("cleanObject", () => {
  it("should remove null values", () => {
    expect(cleanObject({ banana: null, orange: "y" })).toStrictEqual({
      orange: "y",
    });
  });
  it("should remove undefined values", () => {
    expect(cleanObject({ banana: undefined, orange: "y" })).toStrictEqual({
      orange: "y",
    });
  });
});
