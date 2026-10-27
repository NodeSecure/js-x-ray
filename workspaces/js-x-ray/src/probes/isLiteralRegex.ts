// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { defineProbe } from "../defineProbe.ts";
import { SourceFile } from "../SourceFile.ts";
import { reportUnsafeRegex } from "./unsafeRegex.ts";

/**
 * @description Search for RegExpLiteral AST Node
 * @see https://github.com/estree/estree/blob/master/es5.md#regexpliteral
 * @example
 * /hello/
 */
function validateNode(
  node: ESTree.Literal
): [boolean, any?] {
  return [
    "regex" in node
  ];
}

function main(
  node: ESTree.RegExpLiteral,
  options: { sourceFile: SourceFile; }
) {
  reportUnsafeRegex(options.sourceFile, node.regex.pattern, node.loc);
}

export default defineProbe({
  name: "isLiteralRegex",
  nodeTypes: ["Literal"],
  validateNode,
  main,
  breakOnMatch: false
});
