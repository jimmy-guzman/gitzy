type Boundary = Record<string, number | string>;

interface SearchResult<T> {
  item: T;
  score: number;
}

const SCORE_EXACT_MATCH = 1;
const SCORE_STARTS_WITH = 0.9;
const SCORE_CONTAINS = 0.8;
const SCORE_FUZZY_BASE = 0.3;
const SCORE_FUZZY_MULTIPLIER = 0.4;

const MIN_MATCH_RATIO = 0.8;
const MIN_LENGTH_RATIO = 0.3;
const DEFAULT_THRESHOLD = 0.3;
const FLOATING_POINT_TOLERANCE = 0.001;

const DIACRITIC_REGEX = /[\u0300-\u036F]/g;

/**
 * Normalizes text by converting to lowercase and removing accents/diacritics
 *
 * @param text - The text to normalize
 *
 * @returns The normalized text
 */
function normalizeText(text: string) {
  return text.toLowerCase().normalize("NFD").replaceAll(DIACRITIC_REGEX, "");
}

/**
 * Calculates a fuzzy matching score between text and query
 *
 * @param text - The text to search in
 *
 * @param query - The search query
 *
 * @returns A score between 0 and 1, where 1 is a perfect match
 */
function calculateScore(text: string, query: string) {
  const textNormalized = normalizeText(text);
  const queryNormalized = normalizeText(query);

  if (textNormalized === queryNormalized) {
    return SCORE_EXACT_MATCH;
  }

  if (textNormalized.startsWith(queryNormalized)) {
    return SCORE_STARTS_WITH;
  }

  if (textNormalized.includes(queryNormalized)) {
    return SCORE_CONTAINS;
  }

  let queryIndex = 0;
  let matches = 0;

  for (
    let i = 0;
    i < textNormalized.length && queryIndex < queryNormalized.length;
    i++
  ) {
    if (textNormalized[i] === queryNormalized[queryIndex]) {
      matches++;
      queryIndex++;
    }
  }

  const matchRatio = matches / queryNormalized.length;
  const lengthRatio = queryNormalized.length / textNormalized.length;

  if (matchRatio >= MIN_MATCH_RATIO && lengthRatio >= MIN_LENGTH_RATIO) {
    return SCORE_FUZZY_BASE + matchRatio * SCORE_FUZZY_MULTIPLIER;
  }

  return 0;
}

/**
 * Performs fuzzy search on an array of objects
 *
 * @param haystack - Array of objects to search through
 *
 * @param keys - Object keys to search in
 *
 * @param needle - Search query string
 *
 * @param threshold - Minimum score threshold for including results (default: 0.3)
 *
 * @returns Array of matching objects, sorted by relevance score
 */
export const fuzzySearch = <T extends Boundary>(
  haystack: T[],
  keys: Extract<keyof T, string>[],
  needle: string,
  threshold = DEFAULT_THRESHOLD,
) => {
  if (!needle.trim()) {
    return haystack;
  }

  const results: SearchResult<T>[] = [];

  for (const item of haystack) {
    let bestScore = 0;

    for (const key of keys) {
      const value = item[key];

      if (value) {
        const text = String(value);
        const score = calculateScore(text, needle);

        bestScore = Math.max(bestScore, score);
      }
    }

    if (bestScore >= threshold) {
      results.push({ item, score: bestScore });
    }
  }

  results.sort((a, b) => {
    if (Math.abs(b.score - a.score) > FLOATING_POINT_TOLERANCE) {
      return b.score - a.score;
    }

    return haystack.indexOf(a.item) - haystack.indexOf(b.item);
  });

  return results.map((result) => {
    return result.item;
  });
};
