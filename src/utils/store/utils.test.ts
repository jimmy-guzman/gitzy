import fs from "node:fs";
import path from "node:path";

import type { Stats } from "node:fs";

import * as utils from "./utils";

describe("utils", () => {
  it("should return gitzy store path", () => {
    expect(utils.gitzyStorePath()).toMatch(/\/gitzy\/+\w+-store\.json/);
  });
  describe("tryUnlink", () => {
    it("should throw when there is non ENOENT error", () => {
      vi.spyOn(fs, "unlinkSync").mockImplementationOnce(() => {
        throw new Error("some new error");
      });

      expect(() => {
        utils.tryUnlink("path");
      }).toThrow("some new error");
    });
    it("should do nothing when there is a ENOENT error", () => {
      class CustomError extends Error {
        code = "ENOENT";
      }
      vi.spyOn(fs, "unlinkSync").mockImplementationOnce(() => {
        throw new CustomError("ENOENT");
      });

      expect(() => {
        utils.tryUnlink("path");
      }).not.toThrow();
    });
  });
  describe("directoryExists", () => {
    it("should return false when there is no stat", () => {
      vi.spyOn(utils, "tryStat").mockReturnValueOnce(null);
      expect(utils.directoryExists("path")).toBe(false);
    });
    it("should throw when directory does not exist", () => {
      vi.spyOn(fs, "statSync").mockImplementationOnce(() => {
        return {
          isDirectory: () => {
            return false;
          },
        } as Stats;
      });

      expect(() => {
        return utils.directoryExists("path");
      }).toThrow('Path exists and is not a directory: "path"');
    });
  });
  describe("handleError", () => {
    it("should return error when there is null byes", () => {
      expect(() => {
        utils.handleError("path", {
          code: "CODE",
          message: "null bytes",
          name: "name",
        });
      }).toThrow("null bytes");
    });
    it("should return error when an error is not ignored", () => {
      expect(() => {
        utils.handleError("path", {
          code: "CODE",
          message: "message",
          name: "name",
        });
      }).toThrow("message");
    });
    it("should not throw when error is ignored", () => {
      vi.spyOn(path, "dirname").mockReturnValueOnce("path1");
      expect(() => {
        utils.handleError("path2", {
          code: "EEXIST",
          message: "MESSAGE",
          name: "name",
        });
      }).not.toThrow();
    });
  });

  describe("tryState", () => {
    it("should return null when fs.statSync throws", () => {
      vi.spyOn(fs, "statSync").mockImplementationOnce(() => {
        throw new Error("Something went wrong");
      });

      expect(utils.tryStat("filePath")).toBeNull();
    });
  });

  describe("mkdir", () => {
    const DIR_NAME = "dirname";

    it("should do nothing when directory exists", () => {
      vi.spyOn(fs, "statSync").mockImplementationOnce(() => {
        return {
          isDirectory: () => {
            return true;
          },
        } as Stats;
      });
      const mkdirSyncSpy = vi
        .spyOn(fs, "mkdirSync")
        .mockImplementationOnce(vi.fn());

      const handleErrorSpy = vi.spyOn(utils, "handleError");

      vi.spyOn(utils, "directoryExists").mockReturnValueOnce(true);

      utils.mkdir(DIR_NAME);
      expect(mkdirSyncSpy).not.toHaveBeenCalled();
      expect(handleErrorSpy).not.toHaveBeenCalled();
    });
    it("should throw when mkdirSync fails", () => {
      vi.spyOn(fs, "mkdirSync").mockImplementationOnce(() => {
        throw new Error("Something went wrong");
      });

      vi.spyOn(fs, "statSync").mockImplementationOnce(() => {
        // eslint-disable-next-line unicorn/no-useless-undefined -- mockImplementationOnce expects undefined
        return undefined;
      });

      expect(() => {
        utils.mkdir(DIR_NAME);
      }).toThrow("Something went wrong");
    });
    it("should call mkdirSync when directory does not exist", () => {
      const mkdirSyncSpy = vi
        .spyOn(fs, "mkdirSync")
        .mockImplementationOnce(vi.fn());
      const handleErrorSpy = vi.spyOn(utils, "handleError");

      vi.spyOn(utils, "directoryExists").mockReturnValueOnce(false);

      utils.mkdir(DIR_NAME);

      expect(mkdirSyncSpy).toHaveBeenNthCalledWith(1, DIR_NAME, {
        recursive: true,
      });
      expect(handleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
