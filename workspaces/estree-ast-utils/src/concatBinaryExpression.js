// Import Internal Dependencies
import { arrayExpressionToString } from "./arrayExpressionToString.js";
import { VariableTracer } from "./utils/VariableTracer.js";

// CONSTANTS
const kBinaryExprTypes = new Set([
  "Literal",
  "BinaryExpression",
  "ArrayExpression",
  "Identifier"
]);

/**
 * @param {*} node
 * @param {object} options
 * @param {VariableTracer} [options.tracer=null]
 * @param {boolean} [options.stopOnUnsupportedNode=false]
 * @returns {IterableIterator<string>}
 */
export function* concatBinaryExpression(node, options = {}) {
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
