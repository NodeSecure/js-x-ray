// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export function toValue(
  strOrLiteral: string | ESTree.Literal
): string {
  return typeof strOrLiteral === "string" ? strOrLiteral : String(strOrLiteral.value);
}

export function toRaw(
  strOrLiteral: string | ESTree.Literal
): string | undefined {
  return typeof strOrLiteral === "string" ? strOrLiteral : strOrLiteral.raw;
}
