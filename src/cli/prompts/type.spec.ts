import { defaultResolvedConfig } from "@/core/config/defaults";
import { defaultMessageParts } from "@/core/conventional/types";

import { createTypeOptions, type } from "./type";

vi.mock("@clack/prompts", () => {
  return { autocomplete: vi.fn().mockResolvedValue("feat") };
});

const setupTypeOptions = (configOverrides = {}, flags = {}) => {
  return createTypeOptions(
    { ...defaultResolvedConfig, ...configOverrides },
    { emoji: true, ...flags },
  );
};

const setupType = (configOverrides = {}, autofill = {}) => {
  return type({
    answers: defaultMessageParts,
    autofill,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

describe("createTypeOptions", () => {
  it("should create options with emoji when enabled", () => {
    const options = setupTypeOptions();

    const featOption = options.find((o) => o.value === "feat");

    expect(featOption).toStrictEqual({
      hint: "A new feature",
      label: "✨ feat",
      value: "feat",
    });
  });

  it("should not have an emoji when emoji.enabled is false", () => {
    const options = setupTypeOptions({
      emoji: { ...defaultResolvedConfig.emoji, enabled: false },
    });

    const featOption = options.find((o) => o.value === "feat");

    expect(featOption?.label).toBe("feat");
  });

  it("should not have an emoji when --no-emoji", () => {
    const options = setupTypeOptions({}, { emoji: false });

    const featOption = options.find((o) => o.value === "feat");

    expect(featOption?.label).toBe("feat");
  });

  it("should handle unknown type gracefully", () => {
    const options = setupTypeOptions({
      types: [{ description: "", emoji: "", name: "custom" }],
    });

    expect(options[0]).toStrictEqual({
      hint: "",
      label: "custom",
      value: "custom",
    });
  });
});

describe("type", () => {
  it("should return a factory function", () => {
    const factory = setupType();

    expect(factory).toBeTypeOf("function");
  });

  it("should skip prompt and return autofill value when provided", async () => {
    const factory = setupType({}, { type: "fix" });

    const result = await factory();

    expect(result).toBe("fix");
  });

  it("should call autocomplete when no autofill", async () => {
    const { autocomplete } = await import("@clack/prompts");

    const factory = setupType();

    await factory();

    expect(autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        maxItems: 10,
        message: "Choose the type",
        options: expect.any(Array),
      }),
    );
  });

  it("should forward initialValue to autocomplete", async () => {
    const { autocomplete } = await import("@clack/prompts");

    const factory = type({
      answers: defaultMessageParts,
      autofill: {},
      config: defaultResolvedConfig,
      flags: {},
      initial: { type: "fix" },
    });

    await factory();

    expect(autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: "fix" }),
    );
  });
});
