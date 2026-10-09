// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { defineProbe } from "../defineProbe.ts";
import { SourceFile } from "../SourceFile.ts";
import { extractNode } from "../utils/index.ts";

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
  _node: ESTree.ArrayExpression
): [boolean, any?] {
  return [true];
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

export default defineProbe({
  name: "isArrayExpression",
  nodeTypes: ["ArrayExpression"],
  validateNode,
  main,
  breakOnMatch: false
});
