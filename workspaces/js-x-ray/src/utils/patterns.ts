// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { toValue } from "../estree/index.ts";

/**
 * @description get the common string prefix (at the start) pattern
 * @example
 * commonStringPrefix("boo", "foo"); // null
 * commonStringPrefix("bromance", "brother"); // "bro"
 */
export function commonStringPrefix(
  leftAnyValue: ESTree.Literal | string,
  rightAnyValue: ESTree.Literal | string
): string | null {
  const leftStr = toValue(leftAnyValue);
  const rightStr = toValue(rightAnyValue);

  // The length of leftStr cannot be greater than that rightStr
  const minLen = leftStr.length > rightStr.length ? rightStr.length : leftStr.length;
  let len = 0;

  for (let id = 0; id < minLen; id++) {
    if (leftStr[id] !== rightStr[id]) {
      break;
    }
    len++;
  }

  return len === 0 ? null : leftStr.slice(0, len);
}

function reverseString(
  string: string
): string {
  return string.split("").reverse().join("");
}

/**
 * @description get the common string suffixes (at the end) pattern
 * @param {!string} leftStr
 * @param {!string} rightStr
 * @returns {string | null}
 *
 * @example
 * commonStringSuffix("boo", "foo"); // oo
 * commonStringSuffix("bromance", "brother"); // null
 */
export function commonStringSuffix(
  leftStr: string,
  rightStr: string
): string | null {
  const commonPrefix = commonStringPrefix(
    reverseString(leftStr),
    reverseString(rightStr)
  );

  return commonPrefix === null ? null : reverseString(commonPrefix);
}

export function commonHexadecimalPrefix(
  identifiersArray: string[]
): { oneTimeOccurence: number; prefix: Record<string, number>; } {
  if (!Array.isArray(identifiersArray)) {
    throw new TypeError("identifiersArray must be an Array");
  }
  const prefix = new Map<string, number>();

  mainLoop: for (const value of identifiersArray.sort()) {
    for (const [cp, count] of prefix) {
      const commonStr = commonStringPrefix(value, cp);
      if (commonStr === null) {
        continue;
      }

      if (commonStr === cp || commonStr.startsWith(cp)) {
        prefix.set(cp, count + 1);
      }
      else if (cp.startsWith(commonStr)) {
        prefix.delete(cp);
        prefix.set(commonStr, count + 1);
      }
      continue mainLoop;
    }

    prefix.set(value, 1);
  }

  // We remove one-time occurences (because they are normal variables)
  let oneTimeOccurence = 0;
  for (const [key, value] of prefix) {
    if (value === 1) {
      prefix.delete(key);
      oneTimeOccurence++;
    }
  }

  return {
    oneTimeOccurence,
    prefix: Object.fromEntries(prefix)
  };
}
