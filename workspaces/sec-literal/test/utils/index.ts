// Import Internal Dependencies
import type { ESTreeLiteral } from "../../src/literal.ts";

// @see https://github.com/estree/estree/blob/master/es5.md#literal
export function createLiteral(
  value: string,
  includeRaw = false
): ESTreeLiteral {
  const node: ESTreeLiteral = { type: "Literal", value };
  if (includeRaw) {
    node.raw = value;
  }

  return node;
}

