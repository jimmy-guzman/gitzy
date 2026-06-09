import type { Answers } from "@/cli/types";

import { defaultResolvedConfig } from "@/core/config/defaults";

import { signoff } from "./signoff";

vi.mock("@clack/prompts", () => ({
  text: vi.fn().mockResolvedValue(""),
}));

vi.mock("@/core/git/signoff", () => {
  return {
    getSignoffTrailer: vi.fn().mockResolvedValue("Jane Doe <jane@example.com>"),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const emptyAnswers: Answers = {
  body: "",
  breaking: "",
  issues: [],
  scope: "",
  subject: "",
  type: "",
};

const setupSignoff = (autofill = {}) => {
  return signoff({
    answers: emptyAnswers,
    autofill,
    config: defaultResolvedConfig,
    flags: {},
  });
};

describe("signoff", () => {
  it("should return a factory function", () => {
    const factory = setupSignoff();

    expect(factory).toBeTypeOf("function");
  });

  it("should return the boolean autofill value verbatim", async () => {
    const factory = setupSignoff({ signoff: true });

    await expect(factory()).resolves.toBe(true);
  });

  it("should return the string autofill override verbatim", async () => {
    const factory = setupSignoff({ signoff: "Bot <bot@example.com>" });

    await expect(factory()).resolves.toBe("Bot <bot@example.com>");
  });

  it("should prefill the text prompt with the derived git identity", async () => {
    const { text } = await import("@clack/prompts");

    const factory = setupSignoff();

    await factory();

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: "Jane Doe <jane@example.com>",
        message: "Signed-off-by",
      }),
    );
  });

  it("should prefill with the prior signature when amending", async () => {
    const { text } = await import("@clack/prompts");

    const factory = signoff({
      answers: emptyAnswers,
      config: defaultResolvedConfig,
      flags: {},
      initial: { ...emptyAnswers, signoff: "Prev <prev@example.com>" },
    });

    await factory();

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: "Prev <prev@example.com>",
      }),
    );
  });
});
