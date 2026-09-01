// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isIdentifier, isStringLiteral } from "../types.ts";

/**
 * Returns null for a computed identifier (`{ [cost]: 1 }`), whose key is only known at runtime.
 */
function getPropertyName(prop: ESTree.Property): string | null {
  if (!prop.computed && isIdentifier(prop.key)) {
    return prop.key.name;
  }
  if (isStringLiteral(prop.key)) {
    return prop.key.value;
  }

  return null;
}

/**
 * Finds the first property whose key name is in `names` and whose value matches `predicate`.
 */
export function findPropertyMatch<T extends ESTree.Node>(
  properties: ESTree.ObjectExpression["properties"],
  names: string[],
  predicate: (value: ESTree.Node) => value is T
): T | null {
  for (const prop of properties) {
    if (prop.type !== "Property") {
      continue;
    }

    const key = getPropertyName(prop);

    if (
      key !== null &&
      names.includes(key) &&
      predicate(prop.value)
    ) {
      return prop.value;
    }
  }

  return null;
}
