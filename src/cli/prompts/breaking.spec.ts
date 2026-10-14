import type * as clack from "@clack/prompts";

import { defaultResolvedConfig } from "@/core/config/defaults";
import type { ResolvedConfig } from "@/core/config/types";

import { breaking } from "./breaking";

vi.mock(import("@clack/prompts"), () => ({
  confirm: vi.fn<typeof clack.confirm>().mockResolvedValue(false),
  text: vi.fn<typeof clack.text>().mockResolvedValue(""),
}));

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
    const { confirm } = await import("@clack/prompts");

    const factory = setupBreaking({ breaking: { format: "!" } });

    await factory();

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Is this a breaking change?",
      })
    );
  });

  it("should call text when format is not '!'", async () => {
    const { text } = await import("@clack/prompts");

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
    const { confirm } = await import("@clack/prompts");

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
    });

    await factory();

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: true,
      })
    );
  });
});
