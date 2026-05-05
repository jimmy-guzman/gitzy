import { defaultResolvedConfig } from "@/core/config/defaults";
import { defaultMessageParts } from "@/core/conventional/types";

import { scope } from "./scope";

vi.mock("@clack/prompts", () => {
  return { autocomplete: vi.fn().mockResolvedValue("build") };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const setupScope = (configOverrides = {}, autofill = {}) => {
  return scope({
    answers: defaultMessageParts,
    autofill,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

describe("scope", () => {
  it("should return undefined from factory if no scopes", () => {
    const factory = setupScope();

    expect(factory()).toBeUndefined();
  });

  it("should skip prompt and return autofill value when provided", async () => {
    const factory = setupScope(
      { scopes: [{ name: "build" }] },
      { scope: "build" },
    );

    const result = await factory();

    expect(result).toBe("build");
  });

  it("should call autocomplete when scopes are configured", async () => {
    const { autocomplete } = await import("@clack/prompts");

    const factory = setupScope({ scopes: [{ name: "build" }] });

    await factory();

    expect(autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        maxItems: 10,
        message: "Choose the scope",
        options: [{ hint: undefined, label: "build", value: "build" }],
      }),
    );
  });

  it("should pass initialValue from amend initial", async () => {
    const { autocomplete } = await import("@clack/prompts");

    const factory = scope({
      answers: defaultMessageParts,
      config: { ...defaultResolvedConfig, scopes: [{ name: "build" }] },
      flags: {},
      initial: {
        body: "",
        breaking: "",
        issues: [],
        scope: "build",
        subject: "",
        type: "",
      },
    });

    await factory();

    expect(autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: "build",
      }),
    );
  });
});
