import { notice } from "./log";

const ESC = String.fromCodePoint(0x1b);

const setIsTTY = (stream: NodeJS.WriteStream, value: boolean | undefined) => {
  Object.defineProperty(stream, "isTTY", { configurable: true, value });
};

describe(notice.warn, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    setIsTTY(process.stdout, undefined);
    setIsTTY(process.stderr, undefined);
  });

  it("should write to stderr without colors when only stdout is a terminal", () => {
    for (const name of ["FORCE_COLOR", "NO_COLOR"]) {
      vi.stubEnv(name, process.env[name]);
      Reflect.deleteProperty(process.env, name);
    }

    setIsTTY(process.stdout, true);
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    const stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    notice.warn("heads up");

    const stderr = stderrSpy.mock.calls.map(([chunk]) => chunk).join("");

    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderr).toContain("heads up");
    expect(stderr).not.toContain(ESC);
  });
});
