// CONSTANTS
const kCommentPattern = /\/\*[\s\S]*?\*\/\r?\n?|\/\/.{0,200}?(?:\r?\n|$)/g;

/**
 * This code has been imported from:
 * https://github.com/MartinKolarik/is-minified-code
 */
export function isMinifiedCode(
  code: string
): boolean {
  const cleaned = code.replace(kCommentPattern, "");
  const lines: number[] = [];
  let lineStart = 0;

  // Replicate /\r?\n$/ without a second regex pass + intermediate string
  let end = cleaned.length;
  if (end > 0 && cleaned[end - 1] === "\n") {
    end--;
    if (end > 0 && cleaned[end - 1] === "\r") {
      end--;
    }
  }

  // Replicate .split("\n").flatMap(...) without allocating a string[]
  for (let i = 0; i <= end; i++) {
    if (i === end || cleaned[i] === "\n") {
      const len = i - lineStart;
      if (len > 0) {
        lines.push(len);
      }
      lineStart = i + 1;
    }
  }

  return lines.length <= 1 || median(lines) > 200;
}

function median(
  values: number[]
): number {
  // Sort in-place: `values` is the local `lines` array, not used after this call
  values.sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);

  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2;
}
