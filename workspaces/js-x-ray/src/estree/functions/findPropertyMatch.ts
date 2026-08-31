// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isIdentifier } from "../types.ts";

/**
 * Finds the first property whose key name is in `names` and whose value matches `predicate`.
 *
 * limitation: computed keys (e.g. `{ [cost]: 1 }`) use 'cost'` as the real key instead of the literal
 * name "cost", so excluding them avoids matching on the wrong property
 */
export function findPropertyMatch<T extends ESTree.Node>(
  properties: ESTree.ObjectExpression["properties"],
  names: string[],
  predicate: (value: ESTree.Node) => value is T
): T | null {
  for (const prop of properties) {
    if (
      prop.type === "Property" &&
      !prop.computed &&
      isIdentifier(prop.key) &&
      names.includes(prop.key.name) &&
      predicate(prop.value)
    ) {
      return prop.value;
    }
  }

  return null;
}
