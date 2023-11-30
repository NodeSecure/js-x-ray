// Import Third-party Dependencies
import isStringSvg from "is-svg";
import stringWidth from "string-width";

// Import Internal Dependencies
import { toValue } from "./literal.js";

/**
 * @param {SecLiteral.Literal | string} strOrLiteral
 * @returns {boolean}
 */
export function isSvg(strOrLiteral) {
  try {
    const value = toValue(strOrLiteral);

    return isStringSvg(value) || isSvgPath(value);
  }
  catch {
    return false;
  }
}

/**
 * @description detect if a given string is a svg path or not.
 * @param {!string} str svg path literal
 * @returns {boolean}
 */
export function isSvgPath(str) {
  if (typeof str !== "string") {
    return false;
  }
  const trimStr = str.trim();

  return trimStr.length > 4 && /^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(trimStr) && /[\dz]$/i.test(trimStr);
}

/**
 * @description detect if a given string is a morse value.
 * @param {!string} str any string value
 * @returns {boolean}
 */
export function isMorse(str) {
  return /^[.-]{1,5}(?:[\s\t]+[.-]{1,5})*(?:[\s\t]+[.-]{1,5}(?:[\s\t]+[.-]{1,5})*)*$/g.test(str);
}

/**
 * @param {!string} str any string value
 * @returns {string}
 */
export function escapeRegExp(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * @description Get the number of unique chars in a given string
 * @param {!string} str string
 * @param {string[]} [charsToExclude=[]]
 * @returns {number}
 */
export function stringCharDiversity(str, charsToExclude = []) {
  const data = new Set(str);
  charsToExclude.forEach((char) => data.delete(char));

  return data.size;
}

// ---
const kMaxSafeStringLen = 45;
const kMaxSafeStringCharDiversity = 70;
const kMinUnsafeStringLenThreshold = 200;
const kScoreStringLengthThreshold = 750;

/**
 * @description Analyze a given string an give it a suspicion score (higher than 1 or 2 mean that the string is highly suspect).
 * @param {!string} str string to analyze
 * @returns {number}
 */
export function stringSuspicionScore(str) {
  const strLen = stringWidth(str);
  if (strLen < kMaxSafeStringLen) {
    return 0;
  }

  const includeSpace = str.includes(" ");
  const includeSpaceAtStart = includeSpace ? str.slice(0, kMaxSafeStringLen).includes(" ") : false;

  let suspectScore = includeSpaceAtStart ? 0 : 1;
  if (strLen > kMinUnsafeStringLenThreshold) {
    suspectScore += Math.ceil(strLen / kScoreStringLengthThreshold);
  }

  return stringCharDiversity(str) >= kMaxSafeStringCharDiversity ? suspectScore + 2 : suspectScore;
}
