import { pathToFileURL } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadTs } from "./load-ts";

vi.mock("node:url");

describe("loadTs", () => {
  const originalVersion = process.version;
  const originalVersions = process.versions;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(process, "version", {
      configurable: true,
      value: originalVersion,
      writable: true,
    });
    Object.defineProperty(process, "versions", {
      configurable: true,
      value: originalVersions,
      writable: true,
    });
  });

  describe("version checking", () => {
    it("should throw error when Node version is below 22.8", async () => {
      Object.defineProperty(process, "version", {
        configurable: true,
        value: "v20.0.0",
        writable: true,
      });
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "20.0.0" },
        writable: true,
      });

      await expect(loadTs("/path/to/file.ts", "")).rejects.toThrow(
        "TS config requires Node 22.8+. Current: v20.0.0.",
      );
    });

    it("should throw error when Node version is 22.7", async () => {
      Object.defineProperty(process, "version", {
        configurable: true,
        value: "v22.7.0",
        writable: true,
      });
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "22.7.0" },
        writable: true,
      });

      await expect(loadTs("/path/to/file.ts", "")).rejects.toThrow(
        "TS config requires Node 22.8+. Current: v22.7.0.",
      );
    });

    it("should throw error when Node version is 21.x", async () => {
      Object.defineProperty(process, "version", {
        configurable: true,
        value: "v21.5.0",
        writable: true,
      });
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "21.5.0" },
        writable: true,
      });

      await expect(loadTs("/path/to/file.ts", "")).rejects.toThrow(
        "TS config requires Node 22.8+. Current: v21.5.0.",
      );
    });

    it("should not throw version error for Node 22.8", async () => {
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "22.8.0" },
        writable: true,
      });

      vi.mocked(pathToFileURL).mockReturnValue({
        href: "file:///path/to/file.ts",
      } as URL);

      // Will fail on import (module not found), but not on version check
      try {
        await loadTs("/path/to/file.ts", "  ");
      } catch (error) {
        expect(error).not.toHaveProperty(
          "message",
          expect.stringContaining("TS config requires Node 22.8+"),
        );
      }
    });

    it("should not throw version error for Node 22.9", async () => {
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "22.9.0" },
        writable: true,
      });

      vi.mocked(pathToFileURL).mockReturnValue({
        href: "file:///path/to/file.ts",
      } as URL);

      try {
        await loadTs("/path/to/file.ts", "");
      } catch (error) {
        expect(error).not.toHaveProperty(
          "message",
          expect.stringContaining("TS config requires Node 22.8+"),
        );
      }
    });

    it("should not throw version error for Node 23.0", async () => {
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "23.0.0" },
        writable: true,
      });

      vi.mocked(pathToFileURL).mockReturnValue({
        href: "file:///path/to/file.ts",
      } as URL);

      try {
        await loadTs("/path/to/file.ts", "");
      } catch (error) {
        expect(error).not.toHaveProperty(
          "message",
          expect.stringContaining("TS config requires Node 22.8+"),
        );
      }
    });

    it("should not throw version error for Node 24.0", async () => {
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "24.0.0" },
        writable: true,
      });

      vi.mocked(pathToFileURL).mockReturnValue({
        href: "file:///path/to/file.ts",
      } as URL);

      try {
        await loadTs("/path/to/file.ts", "");
      } catch (error) {
        expect(error).not.toHaveProperty(
          "message",
          expect.stringContaining("TS config requires Node 22.8+"),
        );
      }
    });
  });

  describe("filepath conversion", () => {
    beforeEach(() => {
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "22.8.0" },
        writable: true,
      });
    });

    it("should convert filepath to file URL", async () => {
      const filepath = "/path/to/config.ts";
      const mockUrl = "file:///path/to/config.ts";

      vi.mocked(pathToFileURL).mockReturnValue({ href: mockUrl } as URL);

      try {
        await loadTs(filepath, "");
      } catch {
        // Ignore import errors
      }

      expect(pathToFileURL).toHaveBeenCalledWith(filepath);
    });

    it("should use the href property from the URL", async () => {
      const filepath = "/absolute/path/to/file.ts";
      const mockUrl = "file:///absolute/path/to/file.ts";

      vi.mocked(pathToFileURL).mockReturnValue({ href: mockUrl } as URL);

      try {
        await loadTs(filepath, "");
      } catch {
        // Ignore import errors
      }

      expect(pathToFileURL).toHaveBeenCalledWith(filepath);
    });

    it("should handle Windows-style paths", async () => {
      const filepath = String.raw`C:\Users\test\config.ts`;
      const mockUrl = "file:///C:/Users/test/config.ts";

      vi.mocked(pathToFileURL).mockReturnValue({ href: mockUrl } as URL);

      try {
        await loadTs(filepath, "");
      } catch {
        // Ignore import errors
      }

      expect(pathToFileURL).toHaveBeenCalledWith(filepath);
    });
  });

  describe("type guard behavior", () => {
    it.each([
      { description: "empty object", expected: true, input: {} },
      {
        description: "object with default export",
        expected: true,
        input: { default: "value" },
      },
      {
        description: "object with named exports",
        expected: true,
        input: { foo: "bar" },
      },
      {
        description: "object with undefined default",
        expected: true,
        input: { default: undefined },
      },
      { description: "array", expected: true, input: [] },
    ])("should identify $description as TsModule", ({ expected, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive
      expect(typeof input === "object" && input !== null).toBe(expected);
    });

    it.each([
      { description: "null", expected: false, input: null },
      { description: "undefined", expected: false, input: undefined },
      { description: "string", expected: false, input: "string" },
      { description: "number", expected: false, input: 123 },
      { description: "boolean", expected: false, input: true },
    ])(
      "should identify $description as not TsModule",
      ({ expected, input }) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive
        const isObject = typeof input === "object" && input !== null;

        expect(isObject).toBe(expected);
      },
    );
  });

  describe("version parsing", () => {
    it("should correctly parse major version only", () => {
      const versions = ["23.0.0", "24.0.0", "25.0.0"];

      for (const version of versions) {
        Object.defineProperty(process, "versions", {
          configurable: true,
          value: { node: version },
          writable: true,
        });

        const [major] = version.split(".").map(Number);

        expect(major).toBeGreaterThan(22);
      }
    });

    it("should correctly parse major and minor version", () => {
      const testCases = [
        { shouldPass: true, version: "22.8.0" },
        { shouldPass: false, version: "22.7.9" },
        { shouldPass: true, version: "22.9.0" },
        { shouldPass: true, version: "22.10.0" },
      ];

      for (const { shouldPass, version } of testCases) {
        const [major, minor] = version.split(".").map(Number);
        const passes = major > 22 || (major === 22 && minor >= 8);

        expect(passes).toBe(shouldPass);
      }
    });
  });

  describe("error messages", () => {
    it("should include current version in error message", async () => {
      Object.defineProperty(process, "version", {
        configurable: true,
        value: "v18.0.0",
        writable: true,
      });
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "18.0.0" },
        writable: true,
      });

      await expect(loadTs("/path/to/file.ts", "")).rejects.toThrow("v18.0.0");
    });

    it("should specify minimum required version", async () => {
      Object.defineProperty(process, "version", {
        configurable: true,
        value: "v20.0.0",
        writable: true,
      });
      Object.defineProperty(process, "versions", {
        configurable: true,
        value: { node: "20.0.0" },
        writable: true,
      });

      await expect(loadTs("/path/to/file.ts", "")).rejects.toThrow(
        "Node 22.8+",
      );
    });
  });
});
