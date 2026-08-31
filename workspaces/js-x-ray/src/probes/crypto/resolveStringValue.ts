// Import Internal Dependencies
import { isStringLiteral, isIdentifier } from "../../estree/types.ts";
import type { LiteralIdentifier } from "../../VariableTracer.ts";

/**
 * @description
 * Resolves a string literal, or an identifier tracked back to a string literal assignment
 */
export function resolveStringValue(
  node: unknown,
  literalIdentifiers: Map<string, LiteralIdentifier>
): string | null {
  if (isStringLiteral(node)) {
    return node.value;
  }
  if (isIdentifier(node)) {
    return literalIdentifiers.get(node.name)?.value ?? null;
  }

  return null;
}
