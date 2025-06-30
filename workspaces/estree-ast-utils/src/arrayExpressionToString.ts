// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { TracerOptions } from "./types.js";

export function* arrayExpressionToString(
  node: ESTree.Node | null,
  options: TracerOptions = {}
): IterableIterator<string> {
  const { tracer = null } = options;

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
        if (tracer?.literalIdentifiers.has(row.name)) {
          yield tracer.literalIdentifiers.get(row.name);
        }
        break;
      }
    }
  }
}
