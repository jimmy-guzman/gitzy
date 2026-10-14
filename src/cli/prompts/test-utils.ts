import { group, isCancel } from "@clack/prompts";

import type { Prompter } from "@/cli/types";

/**
 * Builds a prompter whose interactive prompts are fakes; `group` and `isCancel`
 * are clack's real implementations since they never render anything.
 */
export const createFakePrompter = () =>
  ({
    autocomplete: vi.fn<Prompter["autocomplete"]>().mockResolvedValue(""),
    cancel: vi.fn<Prompter["cancel"]>(),
    confirm: vi.fn<Prompter["confirm"]>().mockResolvedValue(false),
    group,
    isCancel,
    multiline: vi.fn<Prompter["multiline"]>().mockResolvedValue(""),
    text: vi.fn<Prompter["text"]>().mockResolvedValue(""),
  }) satisfies Prompter;
