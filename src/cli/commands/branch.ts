/**
 * Branch command — interactive branch name generation flow
 */

import { autocomplete, cancel, group, log, text } from "@clack/prompts";
import type { Command } from "commander";

import type { BranchFlags, GitzyState } from "@/cli/types";
import { createFuzzyFilter } from "@/cli/utils/fuzzy-search";
import { readStdinJson } from "@/cli/utils/stdin";
import { formatBranchName } from "@/core/branch/formatter";
import { parseBranchName } from "@/core/branch/parser";
import type { BranchParts } from "@/core/branch/types";
import { defaultResolvedConfig } from "@/core/config/defaults";
import { resolveConfig } from "@/core/config/resolver";
import {
  createBranch,
  getCurrentBranch,
  renameBranch,
} from "@/core/git/branch";
import { lang } from "@/lang";

interface BranchAnswers {
  issue?: string;
  scope?: string;
  subject: string;
  type: string;
}

const promptBranchQuestions = async (
  state: GitzyState,
  autofill: Partial<BranchAnswers>,
  amendInitial?: Partial<BranchAnswers>
): Promise<BranchAnswers> => {
  if (autofill.type && autofill.subject) {
    const trimmedSubject = autofill.subject.trim();
    const validType = state.config.types.some((t) => t.name === autofill.type);

    if (trimmedSubject && validType) {
      return {
        issue: autofill.issue,
        scope: autofill.scope,
        subject: trimmedSubject,
        type: autofill.type,
      };
    }
  }

  const { config } = state;

  const typeOptions = config.types.map((t) => ({
    hint: t.description,
    label: t.name,
    value: t.name,
  }));

  const scopeOptions = config.scopes.map((s) => ({
    hint: s.description,
    label: s.name,
    value: s.name,
  }));

  const result = await group(
    {
      issue: () => {
        if (autofill.issue !== undefined) {
          return Promise.resolve(autofill.issue);
        }

        return text({
          initialValue: amendInitial?.issue,
          message: "Add an issue reference",
          placeholder: "skip when none",
        });
      },
      scope: () => {
        if (config.scopes.length === 0) {
          return Promise.resolve("");
        }

        if (autofill.scope !== undefined) {
          return Promise.resolve(autofill.scope);
        }

        return autocomplete({
          filter: createFuzzyFilter(scopeOptions),
          initialValue: amendInitial?.scope,
          maxItems: 10,
          message: "Choose the scope",
          options: scopeOptions,
        });
      },
      subject: () => {
        if (autofill.subject !== undefined) {
          return Promise.resolve(autofill.subject);
        }

        return text({
          initialValue: amendInitial?.subject,
          message: "Add a short description",
          validate: (input) =>
            (input ?? "").trim().length === 0
              ? "Subject is required"
              : undefined,
        });
      },
      type: () => {
        if (autofill.type !== undefined) {
          return Promise.resolve(autofill.type);
        }

        return autocomplete({
          filter: createFuzzyFilter(typeOptions),
          initialValue: amendInitial?.type,
          maxItems: 10,
          message: "Choose the type",
          options: typeOptions,
        });
      },
    },
    {
      onCancel: () => {
        cancel("Cancelled.");
        process.exit(0);
      },
    }
  );

  return {
    issue: result.issue,
    scope: result.scope,
    subject: result.subject,
    type: result.type,
  };
};

const toFlagAnswers = (opts: BranchFlags): Partial<BranchAnswers> => ({
  ...(opts.issue ? { issue: opts.issue } : {}),
  ...(opts.scope ? { scope: opts.scope } : {}),
  ...(opts.subject ? { subject: opts.subject } : {}),
  ...(opts.type ? { type: opts.type } : {}),
});

const writeResult = (
  opts: BranchFlags,
  branchName: string,
  oldName?: string
) => {
  if (opts.json) {
    process.stdout.write(
      `${JSON.stringify({
        branchName,
        dryRun: opts.dryRun ?? false,
        ...(oldName === undefined ? {} : { oldName }),
      })}\n`
    );
  } else if (opts.dryRun) {
    log.info(`Branch name: ${branchName}`);
  }
};

export const registerBranchCommand = (program: Command) => {
  program
    .command("branch")
    .description(lang.branch.description)
    .option("--type <type>", lang.branch.flags.type)
    .option("--scope <scope>", lang.branch.flags.scope)
    .option("-m, --subject <subject>", lang.branch.flags.subject)
    .option("--issue <issue>", lang.branch.flags.issue)
    .option("--from <branch>", lang.branch.flags.from)
    .option("-a, --amend", lang.branch.flags.amend)
    .option("--no-checkout", lang.branch.flags.checkout)
    .option("-D, --dry-run", lang.branch.flags.dryRun)
    .option("--json", lang.branch.flags.json)
    .option("--stdin", lang.branch.flags.stdin)
    .addHelpText("after", `\nExamples:\n      ${lang.branch.examples}\n    `)
    .action(async (opts: BranchFlags, cmd: Command) => {
      const state: GitzyState = {
        answers: {
          body: "",
          breaking: "",
          issues: [],
          scope: "",
          subject: "",
          type: "",
        },
        config: defaultResolvedConfig,
      };

      try {
        state.config = await resolveConfig();

        const amendInitial = opts.amend
          ? parseBranchName(
              await getCurrentBranch().catch(() => ""),
              state.config.scopes.map((s) => s.name)
            )
          : undefined;
        const stdinAnswers = opts.stdin
          ? await readStdinJson<Partial<BranchAnswers>>()
          : {};
        const flagAnswers = toFlagAnswers(opts);

        if (
          !process.stdin.isTTY &&
          (!flagAnswers.type || !flagAnswers.subject) &&
          !opts.stdin
        ) {
          cmd.error(
            "No TTY detected. Run gitzy branch --help for non-interactive usage."
          );
        }

        const answers = await promptBranchQuestions(
          state,
          { ...stdinAnswers, ...flagAnswers },
          amendInitial
        );

        const parts: BranchParts = {
          issue: answers.issue,
          scope: answers.scope,
          subject: answers.subject,
          type: answers.type,
        };

        const branchName = formatBranchName(parts, state.config.branch);

        if (opts.amend) {
          const result = await renameBranch(branchName, {
            dryRun: opts.dryRun,
          });

          if (result.hasRemote) {
            log.warn(
              `Remote tracking ref exists for "${result.oldName}". You must manually push and delete the remote branch.`
            );
          }

          writeResult(opts, result.newName, result.oldName);
        } else {
          const result = await createBranch(
            branchName,
            cmd.getOptionValueSource("checkout") === "cli"
              ? opts.checkout
              : state.config.branch.checkout,
            opts.dryRun,
            opts.from
          );

          writeResult(opts, result.branchName);
        }
      } catch (error: unknown) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
