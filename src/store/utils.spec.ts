import type { Stats } from "node:fs";

import fs from "node:fs";
import path from "node:path";

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
      }).toThrowError("some new error");
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
      }).not.toThrowError();
    });
  });

  describe("directoryExists", () => {
    it("should return false when there is no stat", () => {
      vi.spyOn(utils, "tryStat").mockReturnValueOnce(null);

      expect(utils.directoryExists("path")).toBe(false);
    });

    it("should throw when directory does not exist", () => {
      vi.spyOn(fs, "statSync").mockReturnValueOnce({
        isDirectory: () => false,
      } as Stats);

      expect(() => utils.directoryExists("path")).toThrowError(
        'Path exists and is not a directory: "path"',
      );
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
      }).toThrowError("null bytes");
    });

    it("should return error when an error is not ignored", () => {
      expect(() => {
        utils.handleError("path", {
          code: "CODE",
          message: "message",
          name: "name",
        });
      }).toThrowError("message");
    });

    it("should not throw when error is ignored", () => {
      vi.spyOn(path, "dirname").mockReturnValueOnce("path1");

      expect(() => {
        utils.handleError("path2", {
          code: "EEXIST",
          message: "MESSAGE",
          name: "name",
        });
      }).not.toThrowError();
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

    beforeEach(() => {
      vi.clearAllMocks();
      vi.restoreAllMocks();
    });

    it("should do nothing when directory exists", () => {
      const statSyncSpy = vi.spyOn(fs, "statSync").mockReturnValue({
        isDirectory: () => true,
      } as Stats);

      const mkdirSyncSpy = vi.spyOn(fs, "mkdirSync").mockImplementation(() => {
        throw new Error("mkdirSync should not be called");
      });

      const handleErrorSpy = vi
        .spyOn(utils, "handleError")
        .mockImplementation(() => {
          throw new Error("handleError should not be called");
        });

      const dirExists = utils.directoryExists(DIR_NAME);

      expect(dirExists).toBe(true);

      utils.mkdir(DIR_NAME);

      expect(statSyncSpy).toHaveBeenNthCalledWith(1, DIR_NAME);
      expect(statSyncSpy).toHaveBeenNthCalledWith(2, DIR_NAME);
      expect(mkdirSyncSpy).not.toHaveBeenCalled();
      expect(handleErrorSpy).not.toHaveBeenCalled();
    });

    it("should throw when mkdirSync fails", () => {
      vi.spyOn(fs, "statSync").mockImplementation(() => {
        throw new Error("ENOENT");
      });

      vi.spyOn(fs, "mkdirSync").mockImplementation(() => {
        throw new Error("Something went wrong");
      });

      expect(() => {
        utils.mkdir(DIR_NAME);
      }).toThrowError("Something went wrong");
    });

    it("should call mkdirSync when directory does not exist", () => {
      vi.spyOn(fs, "statSync").mockImplementation(() => {
        throw new Error("ENOENT");
      });

      const mkdirSyncSpy = vi
        .spyOn(fs, "mkdirSync")
        .mockImplementation(vi.fn());
      const handleErrorSpy = vi
        .spyOn(utils, "handleError")
        .mockImplementation(vi.fn());

      utils.mkdir(DIR_NAME);

      expect(mkdirSyncSpy).toHaveBeenCalledExactlyOnceWith(DIR_NAME, {
        recursive: true,
      });
      expect(handleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
