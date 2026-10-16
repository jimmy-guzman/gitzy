import { Command } from "commander";

import { defaultResolvedConfig } from "@/core/config/defaults";
import { useTempGitRepo } from "@/core/git/test-utils";

import { collectAnswers } from "./commit";

describe(collectAnswers, () => {
  useTempGitRepo();

  it("should keep amended trailers when --type and --subject skip prompts", async () => {
    const answers = await collectAnswers(
      defaultResolvedConfig,
      { subject: "new subject", type: "feat" },
      new Command(),
      {
        coAuthors: ["A <a@b.c>"],
        signoff: "B <b@c.d>",
        subject: "old subject",
        type: "fix",
      }
    );

    expect(answers).toMatchObject({
      coAuthors: ["A <a@b.c>"],
      signoff: "B <b@c.d>",
      subject: "new subject",
      type: "feat",
    });
  });

  it("should replace amended trailers with --co-author and --signoff", async () => {
    const answers = await collectAnswers(
      defaultResolvedConfig,
      {
        coAuthor: ["X <x@y.z>"],
        signoff: "S <s@t.u>",
        subject: "new subject",
        type: "feat",
      },
      new Command(),
      {
        coAuthors: ["A <a@b.c>"],
        signoff: "B <b@c.d>",
        subject: "old subject",
        type: "fix",
      }
    );

    expect(answers).toMatchObject({
      coAuthors: ["X <x@y.z>"],
      signoff: "S <s@t.u>",
    });
  });
});
