import { danger, info, log } from "./logging";

const message = "logging...";

describe("logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log info", () => {
    expect(info(message)).toMatchInlineSnapshot(`"[34m❯ logging...[39m"`);
  });

  it("should log danger", () => {
    expect(danger(message)).toMatchInlineSnapshot(`"[31m❯ logging...[39m"`);
  });

  it("should log log", () => {
    const spy = vi.spyOn(console, "log").mockImplementationOnce(vi.fn());

    log(message);

    expect(spy).toHaveBeenNthCalledWith(1, message);
  });
});
