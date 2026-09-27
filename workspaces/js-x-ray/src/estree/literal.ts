// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { toLiteral } from "./functions/toLiteral.ts";

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

/**
 * Flatten a Literal or a TemplateLiteral into a string.
 * Template expressions are kept as `${index}` placeholders.
 */
export function literalToString(
  node: ESTree.Literal | ESTree.TemplateLiteral
): string {
  return node.type === "TemplateLiteral" ?
    toLiteral(node) :
    String(node.value);
}
