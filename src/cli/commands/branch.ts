/**
 * Branch command — interactive branch name generation flow
 */

import type { Command } from "commander";

import { styleText } from "node:util";

import type { BranchFlags, GitzyState } from "@/cli/types";
import type { BranchParts } from "@/core/branch/types";

import { createEnquirer } from "@/cli/utils/enquirer";
import { danger, info, log, warn } from "@/cli/utils/logging";
import { formatBranchName } from "@/core/branch/formatter";
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
  amendInitial?: Partial<BranchAnswers>,
): Promise<BranchAnswers> => {
  if (autofill.type && autofill.subject) {
    return {
      issue: autofill.issue,
      scope: autofill.scope,
      subject: autofill.subject,
      type: autofill.type,
    };
  }

  const { config } = state;

  const typeChoices = config.types.map((t) => {
    return {
      hint: t.description?.toLowerCase() ?? "",
      indent: " ",
      message: t.name,
      name: t.name,
      value: t.name,
    };
  });

  const scopeChoices = config.scopes.map((s) => {
    return { indent: " ", message: s.name, name: s.name, value: s.name };
  });

  const prompts = [
    {
      choices: typeChoices,
      hint: "...type or use arrow keys",
      ...(amendInitial?.type === undefined
        ? {}
        : { initial: amendInitial.type }),
      limit: 10,
      message: "Choose the type",
      name: "type",
      type: "autocomplete",
    },
    ...(config.scopes.length > 0
      ? [
          {
            choices: scopeChoices,
            hint: "...type or use arrow keys",
            ...(amendInitial?.scope === undefined
              ? {}
              : { initial: amendInitial.scope }),
            limit: 10,
            message: "Choose the scope",
            name: "scope",
            type: "autocomplete",
          },
        ]
      : []),
    {
      ...(amendInitial?.subject === undefined
        ? {}
        : { initial: amendInitial.subject }),
      message: "Add a short description",
      name: "subject",
      type: "input",
      validate: (input: string) => {
        return input.trim().length > 0 ? true : "Subject is required";
      },
    },
    {
      hint: styleText("dim", "...skip when none"),
      ...(amendInitial?.issue === undefined
        ? {}
        : { initial: amendInitial.issue }),
      message: "Add an issue reference",
      name: "issue",
      type: "input",
    },
  ];

  const enquirer = createEnquirer<BranchAnswers>(
    {
      autofill: true,
      cancel: () => {
        process.exit(0);
      },
      styles: {
        danger: (value: string) => styleText("red", value),
        submitted: (value: string) => styleText("cyan", value),
      },
    },
    autofill,
  );

  return enquirer.prompt(prompts);
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

        let amendInitial: Partial<BranchAnswers> | undefined;

        if (opts.amend) {
          const currentBranch = await getCurrentBranch().catch(() => "");
          const sep = state.config.branch.separator;
          const segments = currentBranch.split(sep);

          const knownScopes = new Set(state.config.scopes.map((s) => s.name));
          const hasScope = knownScopes.has(segments.at(1) ?? "");
          const rawSubjectStart = hasScope
            ? segments.slice(2)
            : segments.slice(1);

          /** Detect and strip a leading `{issue}-` prefix from the first subject segment */
          const issuePrefix = /^(#\d+|[A-Z]+-\d+)-(.+)$/.exec(
            rawSubjectStart[0] ?? "",
          );
          const detectedIssue = issuePrefix ? issuePrefix[1] : undefined;
          const firstSubjectSegment = issuePrefix
            ? issuePrefix[2]
            : rawSubjectStart[0];
          const subjectSegments = [
            firstSubjectSegment,
            ...rawSubjectStart.slice(1),
          ].filter(Boolean);

          amendInitial = {
            ...(detectedIssue === undefined ? {} : { issue: detectedIssue }),
            ...(hasScope ? { scope: segments[1] } : {}),
            subject: subjectSegments.join(sep),
            type: segments[0] ?? "",
          };
        }

        let stdinAnswers: Partial<BranchAnswers> = {};

        if (opts.stdin) {
          const raw = await new Promise<string>((resolve) => {
            let data = "";

            process.stdin.setEncoding("utf8");
            process.stdin.on("data", (chunk) => {
              data += String(chunk);
            });
            process.stdin.on("end", () => {
              resolve(data);
            });
          });

          try {
            stdinAnswers = JSON.parse(raw) as Partial<BranchAnswers>;
          } catch {
            throw new Error("Invalid JSON provided to --stdin");
          }
        }

        const flagAnswers: Partial<BranchAnswers> = {};

        if (opts.type) flagAnswers.type = opts.type;

        if (opts.scope) flagAnswers.scope = opts.scope;

        if (opts.subject) flagAnswers.subject = opts.subject;

        if (opts.issue) flagAnswers.issue = opts.issue;

        const answers = await promptBranchQuestions(
          state,
          { ...stdinAnswers, ...flagAnswers },
          amendInitial,
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
            log(
              warn(
                `Remote tracking ref exists for "${result.oldName}". You must manually push and delete the remote branch.`,
              ),
            );
          }

          if (opts.json) {
            log(
              JSON.stringify({
                branchName: result.newName,
                dryRun: opts.dryRun ?? false,
                oldName: result.oldName,
              }),
            );
          } else if (opts.dryRun) {
            log(info(`Branch name: ${result.newName}`));
          }
        } else {
          const result = await createBranch(
            branchName,
            cmd.getOptionValueSource("checkout") === "cli"
              ? opts.checkout
              : state.config.branch.checkout,
            opts.dryRun,
            opts.from,
          );

          if (opts.json) {
            log(
              JSON.stringify({
                branchName: result.branchName,
                dryRun: opts.dryRun ?? false,
              }),
            );
          } else if (opts.dryRun) {
            log(info(`Branch name: ${result.branchName}`));
          }
        }
      } catch (error: unknown) {
        log(
          `\n${danger(error instanceof Error ? error.message : String(error))}\n`,
        );
        process.exit(1);
      }
    });
};
