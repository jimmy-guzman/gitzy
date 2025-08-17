import { lang } from "../lang";

describe("lang", () => {
  it("should create lang", () => {
    expect(lang).toMatchSnapshot();
  });
});
