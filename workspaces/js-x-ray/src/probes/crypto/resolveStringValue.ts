// Import Internal Dependencies
import { isStringLiteral, isIdentifier } from "../../estree/types.ts";
import type { LiteralIdentifier } from "../../VariableTracer.ts";

/**
 * @description
 * Resolves a string literal, or an identifier tracked back to a string literal assignment.
 * If the identifier is tracked back to a template literal, it will return null.
 */
export function resolveStringValue(
  node: unknown,
  literalIdentifiers: Map<string, LiteralIdentifier>
): string | null {
  if (isStringLiteral(node)) {
    return node.value;
  }
  if (isIdentifier(node)) {
    const literal = literalIdentifiers.get(node.name);
    return literal?.type === "Literal" ? literal.value : null;
  }

  return null;
}
