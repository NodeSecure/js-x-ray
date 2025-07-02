// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  type DefaultOptions,
  noop
} from "./options.js";

export function* arrayExpressionToString(
  node: ESTree.Node | null,
  options: DefaultOptions = {}
): IterableIterator<string> {
  const { externalIdentifierLookup = noop } = options;

  if (!node || node.type !== "ArrayExpression") {
    return;
  }

  for (const row of node.elements) {
    if (row === null) {
      continue;
    }

    switch (row.type) {
      case "Literal": {
        if (
          row.value === ""
        ) {
          continue;
        }

        const value = Number(row.value);
        yield Number.isNaN(value) ?
          String(row.value) :
          String.fromCharCode(value);
        break;
      }
      case "Identifier": {
        const identifier = externalIdentifierLookup(row.name);
        if (identifier !== null) {
          yield identifier;
        }
        break;
      }
    }
  }
}
