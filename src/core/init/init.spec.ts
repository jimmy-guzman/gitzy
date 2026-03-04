import { existsSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { init } from "./init";

vi.mock("node:fs");

describe("init", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should write config file when it does not exist", () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const result = init("/some/dir");

    expect(result).toStrictEqual({
      exists: false,
      filePath: path.join("/some/dir", ".gitzyrc.json"),
    });
    expect(writeFileSync).toHaveBeenCalledWith(
      path.join("/some/dir", ".gitzyrc.json"),
      expect.stringContaining('"types"'),
      "utf8",
    );
  });

  it("should not write file when it already exists", () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const result = init("/some/dir");

    expect(result).toStrictEqual({
      exists: true,
      filePath: path.join("/some/dir", ".gitzyrc.json"),
    });
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("should overwrite file when it already exists and force is true", () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const result = init("/some/dir", { force: true });

    expect(result).toStrictEqual({
      exists: true,
      filePath: path.join("/some/dir", ".gitzyrc.json"),
    });
    expect(writeFileSync).toHaveBeenCalledOnce();
  });

  it("should use process.cwd() as default directory", () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const result = init();

    expect(result.filePath).toBe(path.join(process.cwd(), ".gitzyrc.json"));
  });

  it("should write config with expected content shape", () => {
    vi.mocked(existsSync).mockReturnValue(false);

    init(os.tmpdir());

    const [, content] = vi.mocked(writeFileSync).mock.calls[0] as [
      string,
      string,
      string,
    ];

    expect(content).toContain('"types"');
    expect(content).toContain('"header"');
    expect(content).toContain('"breaking"');
    expect(content).toContain('"issues"');
    expect(content).toContain('"branch"');
  });
});
