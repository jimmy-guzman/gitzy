import { execSync } from "node:child_process";

const setupGitzy = (args: string) => {
  try {
    const output = execSync(`node ./dist/run.mjs --dry-run ${args}`, {
      encoding: "utf8",
    });

    const lines = output.split("\n");
    const messageIndex = lines.findIndex((line) => line.includes("Message..."));

    if (messageIndex === -1) {
      throw new Error("Could not find commit message in output");
    }

    const messageLines = lines.slice(messageIndex + 1).map((line) => {
      return line.replace(/^│\s*/, "");
    });

    // Remove trailing empty lines
    while (messageLines.length > 0 && messageLines.at(-1)?.trim() === "") {
      messageLines.pop();
    }

    return messageLines.join("\n").trim();
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

describe("gitzy", () => {
  it("should create commit message w/ type, scope, message, description, breaking changes and issues closed", () => {
    const result = setupGitzy(
      '-t chore -s e2e -m testing -b "this broke something" -i "#123" -d "some longer description"',
    );

    expect(result).toMatchInlineSnapshot(`
      "chore(e2e): 🤖 testing

      some longer description

      BREAKING CHANGE: 💥 this broke something

      🏁 Closes #123"
    `);
  });
  it("should create commit message w/ type, scope, message and issues closed", () => {
    const result = setupGitzy(
      '--skip breaking body -t chore -s e2e -m testing -i "#123"',
    );

    expect(result).toMatchInlineSnapshot(`
      "chore(e2e): 🤖 testing

      🏁 Closes #123"
    `);
  });
  it("should create commit message w/ type, scope, message and description", () => {
    const result = setupGitzy(
      '--skip breaking issues -t chore -s e2e -m testing -d "some longer description"',
    );

    expect(result).toMatchInlineSnapshot(`
      "chore(e2e): 🤖 testing

      some longer description"
    `);
  });
  it("should create commit message w/ type, scope and message", () => {
    const result = setupGitzy(
      "--skip body breaking issues -t chore -s e2e -m testing",
    );

    expect(result).toMatchInlineSnapshot(`"chore(e2e): 🤖 testing"`);
  });
  it("should create commit message w/ type and message", () => {
    const result = setupGitzy(
      "--skip body breaking issues scope -t chore -m testing",
    );

    expect(result).toMatchInlineSnapshot(`"chore: 🤖 testing"`);
  });

  it("should NOT add '!' when breaking is true", () => {
    const result = setupGitzy(
      "--skip body issues scope -t chore -m testing --breaking",
    );

    expect(result).toMatchInlineSnapshot(`"chore: 🤖 testing"`);
  });
});
