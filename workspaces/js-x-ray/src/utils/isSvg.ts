// Import Third-party Dependencies
import isStringSvg from "is-svg";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { toValue } from "../estree/index.ts";

export function isSvg(
  strOrLiteral: ESTree.Literal | string
): boolean {
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
 */
export function isSvgPath(
  str: string
): boolean {
  if (typeof str !== "string") {
    return false;
  }
  const trimStr = str.trim();

  return trimStr.length > 4
    && /^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(trimStr)
    && /[\dz]$/i.test(trimStr);
}
