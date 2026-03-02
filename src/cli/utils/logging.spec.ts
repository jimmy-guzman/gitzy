import { danger, hint, info, log, warn } from "./logging";

const message = "logging...";

describe("logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log info", () => {
    expect(info(message)).toMatchInlineSnapshot(`"❯ logging..."`);
  });

  it("should log danger", () => {
    expect(danger(message)).toMatchInlineSnapshot(`"❯ logging..."`);
  });

  it("should log warn", () => {
    expect(warn(message)).toMatchInlineSnapshot(`"❯ logging..."`);
  });

  it("should log hint", () => {
    expect(hint(message)).toMatchInlineSnapshot(`"❯ logging..."`);
  });

  it("should log log", () => {
    const spy = vi.spyOn(console, "log").mockImplementationOnce(vi.fn());

    log(message);

    expect(spy).toHaveBeenNthCalledWith(1, message);
  });
});
