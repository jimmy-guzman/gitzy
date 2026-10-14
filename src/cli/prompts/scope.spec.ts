import { defaultResolvedConfig } from "@/core/config/defaults";
import { defaultMessageParts } from "@/core/conventional/types";

import { scope } from "./scope";
import { createFakePrompter } from "./test-utils";

const prompter = createFakePrompter();

const setupScope = (configOverrides = {}, autofill = {}) =>
  scope({
    answers: defaultMessageParts,
    autofill,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
    prompter,
  });

describe(scope, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prompter.autocomplete.mockResolvedValue("build");
  });

  it("should return undefined from factory if no scopes", () => {
    const factory = setupScope();

    expect(factory()).toBeUndefined();
  });

  it("should skip prompt and return autofill value when provided", async () => {
    const factory = setupScope(
      { scopes: [{ name: "build" }] },
      { scope: "build" }
    );

    const result = await factory();

    expect(result).toBe("build");
  });

  it("should call autocomplete when scopes are configured", async () => {
    const { autocomplete } = prompter;

    const factory = setupScope({ scopes: [{ name: "build" }] });

    await factory();

    expect(autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        maxItems: 10,
        message: "Choose the scope",
        options: [{ hint: undefined, label: "build", value: "build" }],
      })
    );
  });

  it("should pass description as hint in autocomplete options", async () => {
    const { autocomplete } = prompter;

    const factory = setupScope({
      scopes: [
        { description: "dependency updates", name: "deps" },
        { name: "build" },
      ],
    });

    await factory();

    expect(autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { hint: "dependency updates", label: "deps", value: "deps" },
          { hint: undefined, label: "build", value: "build" },
        ],
      })
    );
  });

  it("should pass initialValue from amend initial", async () => {
    const { autocomplete } = prompter;

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
      prompter,
    });

    await factory();

    expect(autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: "build",
      })
    );
  });
});
