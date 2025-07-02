// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";
import { extractNode } from "../utils/index.js";

// CONSTANTS
const kLiteralExtractor = extractNode<ESTree.Literal>("Literal");

/**
 * @description Search for ArrayExpression AST Node (Commonly known as JS Arrays)
 *
 * @see https://github.com/estree/estree/blob/master/es5.md#arrayexpression
 * @example
 * ["foo", "bar", 1]
 */
function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  return [
    node.type === "ArrayExpression"
  ];
}

function main(
  node: ESTree.ArrayExpression,
  { sourceFile }: { sourceFile: SourceFile; }
) {
  kLiteralExtractor(
    (literalNode) => sourceFile.analyzeLiteral(literalNode, true),
    node.elements
  );
}

export default {
  name: "isArrayExpression",
  validateNode,
  main,
  breakOnMatch: false
};
