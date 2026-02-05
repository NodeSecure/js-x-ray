// CONSTANTS
const kLenSegmenter = new Intl.Segmenter();

/**
 * Note: this is not a perfect way to calculate the width of a string, but it should be good enough for our use case.
 * We are not trying to be 100% accurate, but rather to have a rough estimate of the width of a string.
 */
function stringLength(
  string: string
): number {
  if (string === "") {
    return 0;
  }

  let length = 0;
  for (const _ of kLenSegmenter.segment(string)) {
    length++;
  }

  return length;
}

/**
 * @description Get the number of unique chars in a given string
 * @param {!string} str string
 * @param {string[]} [charsToExclude=[]]
 * @returns {number}
 */
export function stringCharDiversity(
  str: string,
  charsToExclude: Iterable<string> = []
): number {
  const data = new Set(str);
  [...charsToExclude].forEach((char) => data.delete(char));

  return data.size;
}

// ---
const kMaxSafeStringLen = 45;
const kMaxSafeStringCharDiversity = 70;
const kMinUnsafeStringLenThreshold = 200;
const kScoreStringLengthThreshold = 750;

/**
 * @description Analyze a given string an give it a suspicion score (higher than 1 or 2 mean that the string is highly suspect).
 */
export function stringSuspicionScore(
  str: string
): number {
  const strLen = stringLength(str);
  if (strLen < kMaxSafeStringLen) {
    return 0;
  }

  const includeSpace = str.includes(" ");
  const includeSpaceAtStart = includeSpace ?
    str.slice(0, kMaxSafeStringLen).includes(" ") :
    false;

  let suspectScore = includeSpaceAtStart ? 0 : 1;
  if (strLen > kMinUnsafeStringLenThreshold) {
    suspectScore += Math.ceil(strLen / kScoreStringLengthThreshold);
  }

  return stringCharDiversity(str) >= kMaxSafeStringCharDiversity ?
    suspectScore + 2 :
    suspectScore;
}
