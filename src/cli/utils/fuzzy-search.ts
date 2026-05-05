import type { Option } from "@clack/prompts";

import uFuzzy from "@leeoniya/ufuzzy";

const uf = new uFuzzy({
  intraDel: 1,
  intraIns: 1,
  intraMode: 1,
  intraSub: 1,
  intraTrn: 1,
});

/**
 * Creates a fuzzy filter function compatible with `@clack/prompts` autocomplete.
 *
 * Because Clack's `filter` is called per-option, we use a cached search that
 * runs once per unique needle and returns a Set of matching values.
 */
export const createFuzzyFilter = <Value>(
  options: Option<Value>[],
): ((search: string, option: Option<Value>) => boolean) => {
  let lastNeedle = "";
  let matchingValues = new Set<Value>();

  return (search: string, option: Option<Value>) => {
    if (search.trim() === "") return true;

    if (search !== lastNeedle) {
      lastNeedle = search;
      matchingValues = new Set();

      const haystack = options.map((opt) => {
        const label = opt.label ?? String(opt.value);
        const hint = opt.hint ?? "";

        return `${label}|${hint}`;
      });

      const [indexes, _info, order] = uf.search(
        uFuzzy.latinize(haystack),
        uFuzzy.latinize(search),
      );

      if (indexes && order && indexes.length > 0) {
        for (const orderIdx of order) {
          matchingValues.add(options[indexes[orderIdx]].value);
        }
      } else {
        const lowerNeedle = search.toLowerCase();

        for (const [idx, item] of haystack.entries()) {
          if (item.toLowerCase().includes(lowerNeedle)) {
            matchingValues.add(options[idx].value);
          }
        }
      }
    }

    return matchingValues.has(option.value);
  };
};
