// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { toValue, toRaw } from "../estree/index.ts";
import { stringCharDiversity } from "./stringSuspicionScore.ts";

// CONSTANTS
const kUnsafeHexValues = new Set([
  "require",
  "length"
].map((value) => Buffer.from(value).toString("hex")));
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
 */
export function isHex(
  anyValue: ESTree.Literal | string
): boolean {
  const value = toValue(anyValue);

  return typeof value === "string" && /^[0-9A-Fa-f]{4,}$/g.test(value);
}

/**
 * @description detect if the given string is a safe Hexadecimal value
 */
export function isSafe(
  anyValue: ESTree.Literal | string
): boolean {
  const rawValue = toRaw(anyValue);
  if (typeof rawValue === "undefined" || kUnsafeHexValues.has(rawValue)) {
    return false;
  }

  const charCount = stringCharDiversity(rawValue);
  if (
    /^([0-9]+|[a-z]+|[A-Z]+)$/g.test(rawValue)
    || rawValue.length <= 5
    || charCount <= 2
  ) {
    return true;
  }

  return [...kSafeHexValues].some(
    (value) => rawValue.toLowerCase().startsWith(value)
  );
}
