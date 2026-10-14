import { defaultResolvedConfig } from "@/core/config/defaults";
import * as signoffModule from "@/core/git/signoff";

import { createPrompts } from "./create-prompts";
import { createFakePrompter } from "./test-utils";

describe(createPrompts, () => {
  let prompter = createFakePrompter();

  beforeEach(() => {
    prompter = createFakePrompter();
    prompter.autocomplete.mockResolvedValue("feat");
    vi.spyOn(signoffModule, "getSignoffTrailer").mockResolvedValue(
      "Jane Doe <jane@example.com>"
    );
  });

  it("should return answers with default prompts", async () => {
    const result = await createPrompts(
      {
        answers: {
          body: "",
          breaking: "",
          issues: [],
          scope: "",
          subject: "",
          type: "",
        },
        config: defaultResolvedConfig,
      },
      {},
      undefined,
      undefined,
      prompter
    );

    expect(result).toStrictEqual({
      body: "",
      breaking: "",
      coAuthors: [],
      issues: [],
      scope: "",
      signoff: false,
      subject: "",
      type: "feat",
    });
  });

  it("should only include configured prompts", async () => {
    await createPrompts(
      {
        answers: {
          body: "",
          breaking: "",
          issues: [],
          scope: "",
          subject: "",
          type: "",
        },
        config: { ...defaultResolvedConfig, prompts: ["type"] },
      },
      {},
      undefined,
      undefined,
      prompter
    );

    expect(prompter.autocomplete).toHaveBeenCalledOnce();
    expect(prompter.confirm).not.toHaveBeenCalled();
    expect(prompter.multiline).not.toHaveBeenCalled();
    expect(prompter.text).not.toHaveBeenCalled();
  });

  it("should skip unknown prompt names", async () => {
    await createPrompts(
      {
        answers: {
          body: "",
          breaking: "",
          issues: [],
          scope: "",
          subject: "",
          type: "",
        },
        config: {
          ...defaultResolvedConfig,
          prompts: ["type", "unknown-prompt"],
        },
      },
      {},
      undefined,
      undefined,
      prompter
    );

    expect(prompter.autocomplete).toHaveBeenCalledOnce();
    expect(prompter.confirm).not.toHaveBeenCalled();
    expect(prompter.multiline).not.toHaveBeenCalled();
    expect(prompter.text).not.toHaveBeenCalled();
  });

  it("should use autofill values to skip prompts", async () => {
    const result = await createPrompts(
      {
        answers: {
          body: "",
          breaking: "",
          issues: [],
          scope: "",
          subject: "",
          type: "",
        },
        config: defaultResolvedConfig,
      },
      {},
      {
        body: "my body",
        breaking: false,
        issues: ["#123"],
        scope: "",
        subject: "my subject",
        type: "fix",
      },
      undefined,
      prompter
    );

    expect(result).toStrictEqual({
      body: "my body",
      breaking: false,
      coAuthors: [],
      issues: ["#123"],
      scope: "",
      signoff: false,
      subject: "my subject",
      type: "fix",
    });
  });

  it("should include the signoff prompt only when configured", async () => {
    await createPrompts(
      {
        answers: {
          body: "",
          breaking: "",
          issues: [],
          scope: "",
          subject: "",
          type: "",
        },
        config: { ...defaultResolvedConfig, prompts: ["type", "signoff"] },
      },
      {},
      undefined,
      undefined,
      prompter
    );

    expect(prompter.autocomplete).toHaveBeenCalledOnce();
    expect(prompter.text).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: "Signed-off-by" })
    );
    expect(prompter.autocomplete).toHaveBeenCalledBefore(prompter.text);
    expect(prompter.multiline).not.toHaveBeenCalled();
  });

  it("should pass through the signoff signature from the text prompt", async () => {
    prompter.text.mockResolvedValue("Jane Doe <jane@example.com>");

    const result = await createPrompts(
      {
        answers: {
          body: "",
          breaking: "",
          issues: [],
          scope: "",
          subject: "",
          type: "",
        },
        config: { ...defaultResolvedConfig, prompts: ["signoff"] },
      },
      {},
      undefined,
      undefined,
      prompter
    );

    expect(result.signoff).toBe("Jane Doe <jane@example.com>");
  });
});
