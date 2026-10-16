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
      defaultResolvedConfig,
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
      { ...defaultResolvedConfig, prompts: ["type"] },
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
        ...defaultResolvedConfig,
        prompts: ["type", "unknown-prompt"],
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
      defaultResolvedConfig,
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
      { ...defaultResolvedConfig, prompts: ["type", "signoff"] },
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
      { ...defaultResolvedConfig, prompts: ["signoff"] },
      {},
      undefined,
      undefined,
      prompter
    );

    expect(result.signoff).toBe("Jane Doe <jane@example.com>");
  });

  it("should keep parsed trailers when their prompts are not configured", async () => {
    const result = await createPrompts(
      defaultResolvedConfig,
      {},
      undefined,
      { coAuthors: ["A <a@b.c>"], signoff: "B <b@c.d>" },
      prompter
    );

    expect(result.coAuthors).toStrictEqual(["A <a@b.c>"]);
    expect(result.signoff).toBe("B <b@c.d>");
  });

  it("should prefer autofilled trailers over parsed trailers when their prompts are not configured", async () => {
    const result = await createPrompts(
      defaultResolvedConfig,
      {},
      { coAuthors: ["X <x@y.z>"], signoff: "S <s@t.u>" },
      { coAuthors: ["A <a@b.c>"], signoff: "B <b@c.d>" },
      prompter
    );

    expect(result.coAuthors).toStrictEqual(["X <x@y.z>"]);
    expect(result.signoff).toBe("S <s@t.u>");
  });

  it("should prefer configured trailer prompt answers over parsed trailers", async () => {
    const result = await createPrompts(
      { ...defaultResolvedConfig, prompts: ["coAuthors", "signoff"] },
      {},
      undefined,
      { coAuthors: ["A <a@b.c>"], signoff: "B <b@c.d>" },
      prompter
    );

    expect(result.coAuthors).toStrictEqual([]);
    expect(result.signoff).toBe("");
  });
});
