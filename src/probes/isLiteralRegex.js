// Require Internal Dependencies
import { isLiteralRegex } from "../utils.js";
import { warnings } from "../constants.js";

// Require Third-party Dependencies
import safeRegex from "safe-regex";

/**
 * @description Search for RegExpLiteral AST Node
 * @see https://github.com/estree/estree/blob/master/es5.md#regexpliteral
 * @example
 * /hello/
 */
function validateNode(node) {
  return [
    isLiteralRegex(node)
  ];
}

function main(node, options) {
  const { analysis } = options;

  // We use the safe-regex package to detect whether or not regex is safe!
  if (!safeRegex(node.regex.pattern)) {
    analysis.addWarning(warnings.unsafeRegex, node.regex.pattern, node.loc);
  }
}

export default {
  name: "isLiteralRegex",
  validateNode, main, breakOnMatch: false
};
