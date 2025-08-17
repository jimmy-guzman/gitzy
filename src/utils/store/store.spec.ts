import fs from "node:fs";

import { GitzyStore } from "./store";
import * as utils from "./utils";

const mockGitzyStorePath = (): void => {
  vi.spyOn(utils, "gitzyStorePath").mockReturnValueOnce("path");
};

describe("gitzyStore", () => {
  let store: GitzyStore;

  beforeEach(() => {
    store = new GitzyStore();
  });

  afterEach(() => {
    store.clear();
    store.destroy();
  });

  it("should setup gitzy store", () => {
    mockGitzyStorePath();
    expect(new GitzyStore()).toStrictEqual(
      expect.objectContaining({
        clear: expect.any(Function),
        destroy: expect.any(Function),
        json: expect.any(Function),
        load: expect.any(Function),
        path: "path",
        readParseFile: expect.any(Function),
        tryLoad: expect.any(Function),
        writeFile: expect.any(Function),
      }),
    );
  });
  it("should load saved data", () => {
    mockGitzyStorePath();
    store.save({ some: "data" });
    expect(store.load()).toStrictEqual({ some: "data" });
  });

  it("should load data", () => {
    mockGitzyStorePath();
    expect(store.load()).toStrictEqual({});
  });

  it("should throw permission error", () => {
    mockGitzyStorePath();
    class CustomError extends Error {
      code = "EACCES";
    }
    vi.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
      throw new CustomError();
    });
    expect(() => {
      store.load();
    }).toThrow("gitzy does not have permission to load this file");
  });

  it("should return empty data if there is a syntax error", () => {
    mockGitzyStorePath();
    class CustomError extends Error {
      code = "SyntaxError";
    }
    vi.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
      throw new CustomError();
    });
    expect(() => {
      store.load();
    }).not.toThrow();
    expect(store.load()).toStrictEqual({});
  });
});
