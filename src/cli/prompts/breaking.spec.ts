import { defaultResolvedConfig } from "@/core/config/defaults";
import type { ResolvedConfig } from "@/core/config/types";

import { breaking } from "./breaking";
import { createFakePrompter } from "./test-utils";

const prompter = createFakePrompter();

const setupBreaking = (
  configOverrides: Partial<ResolvedConfig> = {},
  autofill = {}
) =>
  breaking({
    answers: {
      body: "",
      breaking: "",
      issues: [],
      scope: "",
      subject: "",
      type: "",
    },
    autofill,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
    prompter,
  });

describe(breaking, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a factory function", () => {
    const factory = setupBreaking();

    expect(factory).toBeTypeOf("function");
  });

  it("should skip prompt and return autofill value when provided", async () => {
    const factory = setupBreaking({}, { breaking: "my breaking change" });

    const result = await factory();

    expect(result).toBe("my breaking change");
  });

  it("should skip prompt with boolean autofill", async () => {
    const factory = setupBreaking(
      { breaking: { format: "!" } },
      { breaking: true }
    );

    const result = await factory();

    expect(result).toBeTruthy();
  });

  it("should call confirm when format is '!'", async () => {
    const { confirm } = prompter;

    const factory = setupBreaking({ breaking: { format: "!" } });

    await factory();

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Is this a breaking change?",
      })
    );
  });

  it("should call text when format is not '!'", async () => {
    const { text } = prompter;

    const factory = setupBreaking();

    await factory();

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Add any breaking changes",
        placeholder: "skip when none",
      })
    );
  });

  it("should pass initialValue from amend for confirm", async () => {
    const { confirm } = prompter;

    const factory = breaking({
      answers: {
        body: "",
        breaking: "",
        issues: [],
        scope: "",
        subject: "",
        type: "",
      },
      config: { ...defaultResolvedConfig, breaking: { format: "!" } },
      flags: {},
      initial: {
        body: "",
        breaking: true,
        issues: [],
        scope: "",
        subject: "",
        type: "",
      },
      prompter,
    });

    await factory();

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: true,
      })
    );
  });
});
