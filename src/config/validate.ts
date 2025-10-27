import { isValiError, parseAsync, summarize } from "valibot";

import { configSchema } from "./schema";

export const validateConfig = async (userConfig: unknown) => {
  try {
    await parseAsync(configSchema, userConfig);

    return true;
  } catch (error) {
    if (isValiError(error)) {
      return summarize(error.issues);
    }

    return "invalid configuration";
  }
};

export const validateUserConfig = async (userConfig: unknown) => {
  const validation = await validateConfig(userConfig);

  if (typeof validation === "string") {
    throw new TypeError(validation);
  }

  return validation;
};
