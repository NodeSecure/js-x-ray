// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import safeRegex from "safe-regex";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.ts";
import { generateWarning } from "../warnings.ts";

/**
 * @description Search for RegExpLiteral AST Node
 * @see https://github.com/estree/estree/blob/master/es5.md#regexpliteral
 * @example
 * /hello/
 */
function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  return [
    node.type === "Literal" && "regex" in node
  ];
}

function main(
  node: ESTree.RegExpLiteral,
  options: { sourceFile: SourceFile; }
) {
  const { sourceFile } = options;

  // We use the safe-regex package to detect whether or not regex is safe!
  if (!safeRegex(node.regex.pattern)) {
    sourceFile.warnings.push(
      generateWarning("unsafe-regex", { value: node.regex.pattern, location: node.loc })
    );
  }
}

export default {
  name: "isLiteralRegex",
  validateNode,
  main,
  breakOnMatch: false
};
