/**
 * Branch command — interactive branch name generation flow
 */

import { autocomplete, cancel, group, log, text } from "@clack/prompts";
import type { Command } from "commander";
import { object, partial, string } from "valibot";

import type { BranchFlags } from "@/cli/types";
import { createFuzzyFilter } from "@/cli/utils/fuzzy-search";
import { readStdinJson } from "@/cli/utils/stdin";
import { formatBranchName } from "@/core/branch/formatter";
import { parseBranchName } from "@/core/branch/parser";
import type { BranchParts } from "@/core/branch/types";
import { resolveConfig } from "@/core/config/resolver";
import type { ResolvedConfig } from "@/core/config/types";
import {
  createBranch,
  getCurrentBranch,
  renameBranch,
} from "@/core/git/branch";
import { lang } from "@/lang";

const PartialBranchAnswersSchema = partial(
  object({
    issue: string(),
    scope: string(),
    subject: string(),
    type: string(),
  })
);

const promptBranchQuestions = async (
  config: ResolvedConfig,
  autofill: Partial<BranchParts>,
  amendInitial?: Partial<BranchParts>
) => {
  if (
    autofill.type !== undefined &&
    autofill.type !== "" &&
    autofill.subject !== undefined
  ) {
    const trimmedSubject = autofill.subject.trim();
    const validType = config.types.some((t) => t.name === autofill.type);

    if (trimmedSubject && validType) {
      return {
        issue: autofill.issue,
        scope: autofill.scope,
        subject: trimmedSubject,
        type: autofill.type,
      };
    }
  }

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

  return await group(
    {
      issue: async () => {
        if (autofill.issue !== undefined) {
          return autofill.issue;
        }

        return await text({
          initialValue: amendInitial?.issue,
          message: "Add an issue reference",
          placeholder: "skip when none",
        });
      },
      scope: async () => {
        if (config.scopes.length === 0) {
          return "";
        }

        if (autofill.scope !== undefined) {
          return autofill.scope;
        }

        return await autocomplete({
          filter: createFuzzyFilter(scopeOptions),
          initialValue: amendInitial?.scope,
          maxItems: 10,
          message: "Choose the scope",
          options: scopeOptions,
        });
      },
      subject: async () => {
        if (autofill.subject !== undefined) {
          return autofill.subject;
        }

        return await text({
          initialValue: amendInitial?.subject,
          message: "Add a short description",
          validate: (input) =>
            (input ?? "").trim().length === 0
              ? "Subject is required"
              : undefined,
        });
      },
      type: async () => {
        if (autofill.type !== undefined) {
          return autofill.type;
        }

        return await autocomplete({
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
};

const toFlagAnswers = (opts: BranchFlags) => {
  const answers: Partial<BranchParts> = {};

  if (opts.issue !== undefined && opts.issue !== "") {
    answers.issue = opts.issue;
  }

  if (opts.scope !== undefined && opts.scope !== "") {
    answers.scope = opts.scope;
  }

  if (opts.subject !== undefined && opts.subject !== "") {
    answers.subject = opts.subject;
  }

  if (opts.type !== undefined && opts.type !== "") {
    answers.type = opts.type;
  }

  return answers;
};

const writeResult = (
  opts: BranchFlags,
  branchName: string,
  oldName?: string
) => {
  if (opts.json === true) {
    process.stdout.write(
      `${JSON.stringify({ branchName, dryRun: opts.dryRun ?? false, oldName })}\n`
    );
  } else if (opts.dryRun === true) {
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
      try {
        const config = await resolveConfig();

        const amendInitial =
          opts.amend === true
            ? parseBranchName(
                await getCurrentBranch().catch(() => ""),
                config.scopes.map((s) => s.name)
              )
            : undefined;
        const stdinAnswers =
          opts.stdin === true
            ? await readStdinJson(PartialBranchAnswersSchema)
            : {};
        const flagAnswers = toFlagAnswers(opts);

        if (
          !process.stdin.isTTY &&
          (flagAnswers.type === undefined ||
            flagAnswers.subject === undefined) &&
          opts.stdin !== true
        ) {
          cmd.error(
            "No TTY detected. Run gitzy branch --help for non-interactive usage."
          );
        }

        const answers = await promptBranchQuestions(
          config,
          { ...stdinAnswers, ...flagAnswers },
          amendInitial
        );

        const branchName = formatBranchName(answers, config.branch);

        if (opts.amend === true) {
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
          await createBranch(
            branchName,
            cmd.getOptionValueSource("checkout") === "cli"
              ? opts.checkout
              : config.branch.checkout,
            opts.dryRun,
            opts.from
          );

          writeResult(opts, branchName);
        }
      } catch (error: unknown) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
