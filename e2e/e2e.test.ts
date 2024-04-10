import { execSync } from "node:child_process";

const setupGitzy = async (args: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    try {
      const result = execSync(`node ./dist/index.mjs --dry-run ${args}`)
        .toString("utf8")
        .split("\n");

      resolve(result.slice(3, result.length - 2).join("\n"));
    } catch (error: unknown) {
      if (error instanceof Error) {
        reject(error);
      }
    }
  });
};

describe("reverse", () => {
  it("should create commit message w/ type, scope, message, description, breaking changes and issues closed", async () => {
    const result = await setupGitzy(
      '-t chore -s e2e -m testing -b "this broke something" -i "#123" -d "some longer description"',
    );

    expect(result).toMatchInlineSnapshot(`
"chore(e2e): 🤖 testing

some longer description

BREAKING CHANGE: 💥 this broke something

🏁 Closes: #123"
`);
  });
  it("should create commit message w/ type, scope, message and issues closed", async () => {
    const result = await setupGitzy(
      '--skip breaking body -t chore -s e2e -m testing -i "#123"',
    );

    expect(result).toMatchInlineSnapshot(`
"chore(e2e): 🤖 testing

🏁 Closes: #123"
`);
  });
  it("should create commit message w/ type, scope, message and description", async () => {
    const result = await setupGitzy(
      '--skip breaking issues -t chore -s e2e -m testing -d "some longer description"',
    );

    expect(result).toMatchInlineSnapshot(`
"chore(e2e): 🤖 testing

some longer description"
`);
  });
  it("should create commit message w/ type, scope and message", async () => {
    const result = await setupGitzy(
      "--skip body breaking issues -t chore -s e2e -m testing",
    );

    expect(result).toMatchInlineSnapshot(`"chore(e2e): 🤖 testing"`);
  });
  it("should create commit message w/ type and message", async () => {
    const result = await setupGitzy(
      "--skip body breaking issues scope -t chore -m testing",
    );

    expect(result).toMatchInlineSnapshot(`"chore: 🤖 testing"`);
  });
});
