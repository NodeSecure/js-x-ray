// Import Internal Dependencies
import type { TracerOptions, NodeAst } from "./types.js";

export function* arrayExpressionToString(
  node: NodeAst,
  options: TracerOptions = {}
): IterableIterator<string> {
  const { tracer = null } = options;

  if (!node || node.type !== "ArrayExpression") {
    return;
  }

  for (const row of node.elements) {
    switch (row.type) {
      case "Literal": {
        if (row.value === "") {
          continue;
        }

        const value = Number(row.value);
        yield Number.isNaN(value) ? row.value : String.fromCharCode(value);
        break;
      }
      case "Identifier": {
        if (tracer !== null && tracer.literalIdentifiers.has(row.name)) {
          yield tracer.literalIdentifiers.get(row.name);
        }
        break;
      }
    }
  }
}
