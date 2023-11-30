// Import Internal Dependencies
import * as Literal from "./literal.js";
import * as Utils from "./utils.js";

const kUnsafeHexValues = new Set([
  "require",
  "length"
].map((value) => Buffer.from(value).toString("hex")));

// CONSTANTS
const kSafeHexValues = new Set([
  "0123456789",
  "123456789",
  "abcdef",
  "abc123456789",
  "0123456789abcdef",
  "abcdef0123456789abcdef"
]);

export const CONSTANTS = Object.freeze({
  SAFE_HEXA_VALUES: [...kSafeHexValues],
  UNSAFE_HEXA_VALUES: [...kUnsafeHexValues]
});

/**
 * @description detect if the given string is an Hexadecimal value
 * @param {SecLiteral.Literal | string} anyValue
 * @returns {boolean}
 */
export function isHex(anyValue) {
  const value = Literal.toValue(anyValue);

  return typeof value === "string" && /^[0-9A-Fa-f]{4,}$/g.test(value);
}

/**
 * @description detect if the given string is a safe Hexadecimal value
 * @param {SecLiteral.Literal | string} anyValue
 * @returns {boolean}
 */
export function isSafe(anyValue) {
  const rawValue = Literal.toRaw(anyValue);
  if (kUnsafeHexValues.has(rawValue)) {
    return false;
  }

  const charCount = Utils.stringCharDiversity(rawValue);
  if (/^([0-9]+|[a-z]+|[A-Z]+)$/g.test(rawValue) || rawValue.length <= 5 || charCount <= 2) {
    return true;
  }

  return [...kSafeHexValues].some((value) => rawValue.toLowerCase().startsWith(value));
}
