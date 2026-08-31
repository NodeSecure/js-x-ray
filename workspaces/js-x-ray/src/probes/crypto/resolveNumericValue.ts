// Import Internal Dependencies
import { isNumericLiteral, isIdentifier } from "../../estree/types.ts";
import type { LiteralIdentifier } from "../../VariableTracer.ts";

/**
 * @description
 * Resolves a numeric literal, or an identifier tracked back to a numeric literal assignment
 */
export function resolveNumericValue(
  node: unknown,
  literalIdentifiers: Map<string, LiteralIdentifier>
): number | null {
  if (isNumericLiteral(node)) {
    return node.value;
  }
  if (isIdentifier(node)) {
    const numValue = Number(literalIdentifiers.get(node.name)?.value);

    return Number.isNaN(numValue) ? null : numValue;
  }

  return null;
}
