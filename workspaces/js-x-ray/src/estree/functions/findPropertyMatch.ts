// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isIdentifier, isStringLiteral } from "../types.ts";

/**
 * Resolve the static name of a property key.
 *
 * A key is statically known when it is written as a plain identifier
 * (`{ cost: 1 }`) or as a string literal, quoted or computed
 * (`{ "cost": 1 }`, `{ ["cost"]: 1 }`) — all three describe the same key.
 *
 * limitation: a computed identifier (e.g. `{ [cost]: 1 }`) uses the *value* of
 * `cost` as the real key instead of the name "cost", so it is only known at
 * runtime. Returning null there avoids matching on the wrong property.
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
