import { pathToFileURL } from "node:url";

import type { Loader } from "lilconfig";
import { lilconfig } from "lilconfig";
import type { GenericSchema } from "valibot";
import { looseObject, safeParse, summarize, unknown } from "valibot";

const configExts = [".js", ".cjs", ".mjs"] as const;
const tsExts = [".ts", ".mts"] as const;

/**
 * Returns the list of file locations lilconfig will search for a config.
 * The `.${configName}rc` entry without an extension is treated as JSON by lilconfig's default loader.
 */
const getSearchPlaces = (configName: string) => {
  const rcExts = [".json", ...configExts];

  const base = [
    `.${configName}rc`,
    ...rcExts.map((ext) => `.${configName}rc${ext}`),
    ...configExts.map((ext) => `${configName}.config${ext}`),
  ];

  const tsBase = tsExts.map((ext) => `${configName}.config${ext}`);

  return [
    "package.json",
    ...base,
    ...tsBase,
    ...base.map((path) => `.config/${path}`),
    ...tsBase.map((path) => `.config/${path}`),
  ];
};

const loadTs: Loader = async (filepath) => {
  const url = pathToFileURL(filepath).href;

  try {
    const mod: unknown = await import(url);

    const parsed = safeParse(looseObject({ default: unknown() }), mod);

    return parsed.success ? parsed.output.default : mod;
  } catch (error: unknown) {
    throw new TypeError(
      `Failed to load TypeScript config at ${filepath}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
};

export const loadConfig = async <const TSchema extends GenericSchema>(
  configName: string,
  schema: TSchema
) => {
  const explorer = lilconfig(configName, {
    loaders: {
      ".mts": loadTs,
      ".ts": loadTs,
    },
    searchPlaces: getSearchPlaces(configName),
  });

  const result = await explorer.search(process.cwd());

  const config: unknown = result?.config;

  if (config === undefined || config === null) {
    return null;
  }

  const parsed = safeParse(schema, config);

  if (!parsed.success) {
    throw new TypeError(summarize(parsed.issues));
  }

  return { input: config, output: parsed.output };
};
