import type { Loader } from "lilconfig";
import type { BaseIssue, BaseSchema } from "valibot";

import { pathToFileURL } from "node:url";

import { lilconfig } from "lilconfig";
import { safeParse, summarize } from "valibot";

const configExts = [".js", ".cjs", ".mjs"] as const;
const tsExts = [".ts", ".mts"] as const;

const getSearchPlaces = (configName: string) => {
  const rcExts = [".json", ...configExts];

  const base = [
    ...rcExts.map((ext) => `.${configName}rc${ext}`),
    ...configExts.map((ext) => `${configName}.config${ext}`),
  ];

  const tsBase = tsExts.map((ext) => `${configName}.config${ext}`);

  return [
    "package.json",
    ...base,
    ...base.map((path) => `.config/${path}`),
    ...tsBase,
    ...tsBase.map((path) => `.config/${path}`),
  ];
};

const loadTs: Loader = async (filepath) => {
  const url = pathToFileURL(filepath).href;

  try {
    const mod = (await import(url)) as Record<string, unknown>;

    return mod.default ?? mod;
  } catch (error: unknown) {
    throw new TypeError(
      `Failed to load TypeScript config at ${filepath}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
};

export const loadConfig = async <
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  configName: string,
  schema: TSchema,
) => {
  const explorer = lilconfig(configName, {
    loaders: {
      ".mts": loadTs,
      ".ts": loadTs,
    },
    searchPlaces: getSearchPlaces(configName),
  });

  const result = await explorer.search(process.cwd());

  if (!result?.config) return null;

  const parsed = safeParse(schema, result.config);

  if (!parsed.success) {
    throw new TypeError(summarize(parsed.issues));
  }

  return parsed.output;
};
