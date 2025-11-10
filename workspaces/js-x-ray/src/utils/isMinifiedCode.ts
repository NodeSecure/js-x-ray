// CONSTANTS
const kCommentPattern = /\/\*[\s\S]*?\*\/\r?\n?|\/\/.{0,200}?(?:\r?\n|$)/g;
const kTrailingLfPattern = /\r?\n$/;

/**
 * This code has been imported from:
 * https://github.com/MartinKolarik/is-minified-code
 */
export function isMinifiedCode(
  code: string
): boolean {
  const lines = code
    .replace(kCommentPattern, "")
    .replace(kTrailingLfPattern, "")
    .split("\n")
    .flatMap((line) => (line.length > 0 ? [line.length] : []));

  return lines.length <= 1 || median(lines) > 200;
}

function median(
  values: number[]
): number {
  const toSorted = [...values].sort((a, b) => a - b);
  const half = Math.floor(toSorted.length / 2);

  if (toSorted.length % 2) {
    return toSorted[half];
  }

  return (toSorted[half - 1] + toSorted[half]) / 2;
}
