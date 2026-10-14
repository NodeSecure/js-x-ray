// Import Internal Dependencies
import { isLiteral, isIdentifier } from "../estree/types.ts";
import type { LiteralIdentifier } from "../VariableTracer.ts";

/**
 * @description
 * Resolves a boolean literal, or an identifier tracked back to a boolean literal assignment
 */
export function resolveBooleanValue(
  node: unknown,
  literalIdentifiers: Map<string, LiteralIdentifier>
): boolean | null {
  if (isLiteral(node)) {
    return typeof node.value === "boolean" ? node.value : null;
  }
  if (isIdentifier(node)) {
    const literal = literalIdentifiers.get(node.name);
    if (literal?.type !== "Literal") {
      return null;
    }

    // The tracer stringifies literal values: `const foo = true` is stored as "true".
    if (literal.value === "true") {
      return true;
    }

    return literal.value === "false" ? false : null;
  }

  return null;
}
