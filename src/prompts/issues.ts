import * as p from "@clack/prompts";

import type { Config } from "@/config/gitzy-schema";

export const issues = async ({
  config: { issuesHint, issuesPrefix },
}: {
  config: Config;
}) => {
  p.note(`issuesPrefix: "${issuesPrefix}"`, "Configured");

  const result = await p.text({
    message: "Add issues this commit closes",
    placeholder: issuesHint,
  });

  if (p.isCancel(result)) {
    process.exit(0);
  }

  return result.trim();
};
