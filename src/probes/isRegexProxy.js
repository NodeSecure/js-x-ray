// Import Third-party Dependencies
import { isLiteralRegex } from "@nodesecure/estree-ast-utils";
import safeRegex from "safe-regex";

/**
 * @description Search for Regex Object constructor.
 * @see https://github.com/estree/estree/blob/master/es5.md#newexpression
 * @example
 * new RegExp("...");
 */
function validateNode(node) {
  return [
    isProxy(node) && node.arguments.length > 1
  ];
}

function main(node, options) {
  const { sourceFile } = options;

  const arg = node.arguments[0];

  /**
   * Note: RegExp Object can contain a RegExpLiteral
   * @see https://github.com/estree/estree/blob/master/es5.md#regexpliteral
   *
   * @example
   * new RegExp(/^foo/)
   */
  const pattern = isLiteralRegex(arg) ? arg.regex.pattern : arg.value;

  // We use the safe-regex package to detect whether or not regex is safe!
  if (!safeRegex(pattern)) {
    sourceFile.addWarning("unsafe-regex", pattern, node.loc);
  }
}

function isProxy(node) {
  if (node.type !== "NewExpression") {
    return false;
  }

  return node.callee.name === "Proxy";
}

export default {
  name: "isRegexProxy",
  validateNode,
  main,
  breakOnMatch: false
};
