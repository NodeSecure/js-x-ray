// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { arrayExpressionToString } from "./arrayExpression.ts";
import {
  type DefaultOptions,
  noop
} from "./options.ts";

// CONSTANTS
const kBinaryExprTypes = new Set([
  "Literal",
  "BinaryExpression",
  "ArrayExpression",
  "Identifier"
]);

export interface ConcatBinaryExpressionOptions extends DefaultOptions {
  /**
   * When set to true, the function will throw an error if it encounters
   * a node type that is not supported (i.e., not a Literal, BinaryExpr, ArrayExpr or Identifier).
   *
   * @default false
   * @example
   * "foo" + fn() + "bar" // <- will throw an error if `stopOnUnsupportedNode` is true
   */
  stopOnUnsupportedNode?: boolean;
}

export function* concatBinaryExpression(
  node: ESTree.BinaryExpression,
  options: ConcatBinaryExpressionOptions = {}
): IterableIterator<string> {
  const {
    externalIdentifierLookup = noop,
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
          externalIdentifierLookup,
          stopOnUnsupportedNode
        });
        break;
      }
      case "ArrayExpression": {
        yield* arrayExpressionToString(
          childNode,
          { externalIdentifierLookup }
        );
        break;
      }
      case "Literal":
        if (typeof childNode.value === "string") {
          yield childNode.value;
        }
        break;
      case "Identifier": {
        const identifier = externalIdentifierLookup(childNode.name);
        if (identifier) {
          yield identifier;
        }
        break;
      }
    }
  }
}
