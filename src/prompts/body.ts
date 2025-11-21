import { isCancel, text } from "@clack/prompts";

// TODO: waiting on multiline support in clack/prompts
export const body = async () => {
  const result = await text({
    message: "Add a longer description\n",
    placeholder: "supports multi line, press enter to go to next line",
  });

  if (isCancel(result)) {
    process.exit(0);
  }

  return result.trim();
};
