import { defaultResolvedConfig } from "@/core/config/defaults";

import { createPrompts } from "./create-prompts";

vi.mock("@clack/prompts", () => {
  return {
    autocomplete: vi.fn().mockResolvedValue("feat"),
    cancel: vi.fn(),
    confirm: vi.fn().mockResolvedValue(false),
    group: vi.fn(async (prompts: Record<string, () => unknown>) => {
      const result: Record<string, unknown> = {};

      for (const [key, fn] of Object.entries(prompts)) {
        const value = await fn();

        if (value !== undefined) {
          result[key] = value;
        }
      }

      return result;
    }),
    isCancel: vi.fn().mockReturnValue(false),
    log: {
      error: vi.fn(),
      info: vi.fn(),
      message: vi.fn(),
      step: vi.fn(),
      success: vi.fn(),
      warn: vi.fn(),
    },
    multiline: vi.fn().mockResolvedValue(""),
    text: vi.fn().mockResolvedValue(""),
  };
});

beforeEach(async () => {
  vi.clearAllMocks();

  const clack = vi.mocked(await import("@clack/prompts"));

  clack.group.mockImplementation(
    async (prompts: Record<string, () => unknown>) => {
      const result: Record<string, unknown> = {};

      for (const [key, fn] of Object.entries(prompts)) {
        const value = await fn();

        if (value !== undefined) {
          result[key] = value;
        }
      }

      return result;
    },
  );
  clack.autocomplete.mockResolvedValue("feat");
  clack.text.mockResolvedValue("");
  clack.confirm.mockResolvedValue(false);
  clack.multiline.mockResolvedValue("");
  clack.isCancel.mockReturnValue(false);
});

describe("createPrompts", () => {
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
    );

    expect(result).toStrictEqual({
      body: "",
      breaking: "",
      coAuthors: [],
      issues: [],
      scope: "",
      subject: "",
      type: "feat",
    });
  });

  it("should only include configured prompts", async () => {
    const { group } = await import("@clack/prompts");

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
    );

    const groupCall = vi.mocked(group).mock.calls[0][0] as Record<
      string,
      unknown
    >;
    const keys = Object.keys(groupCall);

    expect(keys).toStrictEqual(["type"]);
  });

  it("should skip unknown prompt names", async () => {
    const { group } = await import("@clack/prompts");

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
    );

    const groupCall = vi.mocked(group).mock.calls[0][0] as Record<
      string,
      unknown
    >;
    const keys = Object.keys(groupCall);

    expect(keys).toStrictEqual(["type"]);
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
    );

    expect(result).toStrictEqual({
      body: "my body",
      breaking: false,
      coAuthors: [],
      issues: ["#123"],
      scope: "",
      subject: "my subject",
      type: "fix",
    });
  });
});
