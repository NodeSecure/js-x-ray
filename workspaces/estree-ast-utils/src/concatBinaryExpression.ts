// Import Internal Dependencies
import { arrayExpressionToString } from "./arrayExpressionToString.js";
import type { TracerOptions, NodeAst } from "./types.js";

// CONSTANTS
const kBinaryExprTypes = new Set([
  "Literal",
  "BinaryExpression",
  "ArrayExpression",
  "Identifier"
]);

export interface ConcatBinaryExpressionOptions extends TracerOptions {
  stopOnUnsupportedNode?: boolean;
}

export function* concatBinaryExpression(
  node: NodeAst,
  options: ConcatBinaryExpressionOptions = {}
): IterableIterator<string> {
  const {
    tracer = null,
    stopOnUnsupportedNode = false
  } = options;
  const { left, right } = node;

  if (
    stopOnUnsupportedNode &&
    (!kBinaryExprTypes.has(left.type) || !kBinaryExprTypes.has(right.type))
  ) {
    throw new Error("concatBinaryExpression:: Unsupported node detected");
  }

  for (const childNode of [left, right]) {
    switch (childNode.type) {
      case "BinaryExpression": {
        yield* concatBinaryExpression(childNode, {
          tracer,
          stopOnUnsupportedNode
        });
        break;
      }
      case "ArrayExpression": {
        yield* arrayExpressionToString(childNode, { tracer });
        break;
      }
      case "Literal":
        yield childNode.value;
        break;
      case "Identifier":
        if (tracer !== null && tracer.literalIdentifiers.has(childNode.name)) {
          yield tracer.literalIdentifiers.get(childNode.name);
        }
        break;
    }
  }
}
