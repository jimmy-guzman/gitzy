import { danger, hint } from "./logging";

const message = "logging...";

describe("logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log danger", () => {
    expect(danger(message)).toMatchInlineSnapshot(`"❯ logging..."`);
  });

  it("should log hint", () => {
    expect(hint(message)).toMatchInlineSnapshot(`"❯ logging..."`);
  });
});
