/**
 * Branch command — interactive branch name generation flow
 */

import * as clack from "@clack/prompts";
import type { Command } from "commander";
import { object, partial, string } from "valibot";

import { scope } from "@/cli/prompts/scope";
import { type } from "@/cli/prompts/type";
import type { BranchFlags } from "@/cli/types";
import { resolveConfigWithWarnings } from "@/cli/utils/config";
import { notice } from "@/cli/utils/log";
import { readStdinJson } from "@/cli/utils/stdin";
import { formatBranchName } from "@/core/branch/formatter";
import { parseBranchName } from "@/core/branch/parser";
import type { BranchParts } from "@/core/branch/types";
import { validateBranchParts } from "@/core/branch/validate";
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

const assertValid = (config: ResolvedConfig, parts: BranchParts) => {
  const problems = validateBranchParts(config, parts);

  if (problems.length > 0) {
    throw new TypeError(problems.join("\n"));
  }

  return parts;
};

const canSkipPrompts = (opts: BranchFlags, autofill: Partial<BranchParts>) =>
  opts.stdin === true ||
  (autofill.type !== undefined &&
    autofill.type !== "" &&
    autofill.subject !== undefined &&
    autofill.subject !== "");

const promptBranchQuestions = async (
  config: ResolvedConfig,
  opts: BranchFlags,
  autofill: Partial<BranchParts>,
  amendInitial?: Partial<BranchParts>
) => {
  if (canSkipPrompts(opts, autofill)) {
    return assertValid(config, {
      issue: autofill.issue,
      scope: autofill.scope ?? "",
      subject: (autofill.subject ?? "").trim(),
      type: autofill.type ?? "",
    });
  }

  const options = {
    autofill,
    config,
    flags: { emoji: false },
    initial: amendInitial,
    prompter: clack,
  };

  return await clack.group(
    {
      issue: async () => {
        if (autofill.issue !== undefined) {
          return autofill.issue;
        }

        return await clack.text({
          initialValue: amendInitial?.issue,
          message: "Add an issue reference",
          placeholder: "skip when none",
        });
      },
      scope: scope(options),
      subject: async () => {
        if (autofill.subject !== undefined) {
          return autofill.subject;
        }

        return await clack.text({
          initialValue: amendInitial?.subject,
          message: "Add a short description",
          validate: (input) =>
            (input ?? "").trim().length === 0
              ? "Subject is required"
              : undefined,
        });
      },
      type: type(options),
    },
    {
      onCancel: () => {
        clack.cancel("Cancelled.");
        process.exit(0);
      },
    }
  );
};

const toFlagAnswers = (opts: BranchFlags) => ({
  ...(opts.issue !== undefined && opts.issue !== "" && { issue: opts.issue }),
  ...(opts.scope !== undefined && opts.scope !== "" && { scope: opts.scope }),
  ...(opts.subject !== undefined &&
    opts.subject !== "" && { subject: opts.subject }),
  ...(opts.type !== undefined && opts.type !== "" && { type: opts.type }),
});

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
    clack.log.info(`Branch name: ${branchName}`);
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
        const config = await resolveConfigWithWarnings();

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
        const autofillAnswers = { ...stdinAnswers, ...flagAnswers };

        if (!process.stdin.isTTY && !canSkipPrompts(opts, autofillAnswers)) {
          cmd.error(
            "No TTY detected. Run gitzy branch --help for non-interactive usage."
          );
        }

        const answers = await promptBranchQuestions(
          config,
          opts,
          autofillAnswers,
          amendInitial
        );

        const branchName = formatBranchName(answers, config.branch);

        if (opts.amend === true) {
          const result = await renameBranch(branchName, {
            dryRun: opts.dryRun,
          });

          if (result.hasRemote) {
            notice.warn(
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
        notice.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
