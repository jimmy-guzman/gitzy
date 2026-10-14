import type * as clack from "@clack/prompts";

import type { Answers } from "@/cli/types";
import { defaultResolvedConfig } from "@/core/config/defaults";
import type * as signoffModule from "@/core/git/signoff";

import { signoff } from "./signoff";

vi.mock(import("@clack/prompts"), () => ({
  text: vi.fn<typeof clack.text>().mockResolvedValue(""),
}));

vi.mock(import("@/core/git/signoff"), () => ({
  getSignoffTrailer: vi
    .fn<typeof signoffModule.getSignoffTrailer>()
    .mockResolvedValue("Jane Doe <jane@example.com>"),
}));

const emptyAnswers: Answers = {
  body: "",
  breaking: "",
  issues: [],
  scope: "",
  subject: "",
  type: "",
};

const setupSignoff = (autofill = {}) =>
  signoff({
    answers: emptyAnswers,
    autofill,
    config: defaultResolvedConfig,
    flags: {},
  });

describe(signoff, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a factory function", () => {
    const factory = setupSignoff();

    expect(factory).toBeTypeOf("function");
  });

  it("should return the boolean autofill value verbatim", async () => {
    const factory = setupSignoff({ signoff: true });

    await expect(factory()).resolves.toBeTruthy();
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
      })
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
      })
    );
  });
});
