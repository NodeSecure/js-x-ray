// Import Internal Dependencies
import { isLiteralRegex } from "../utils.js";

// Import Third-party Dependencies
import safeRegex from "safe-regex";

/**
 * @description Search for Regex Object constructor.
 * @see https://github.com/estree/estree/blob/master/es5.md#newexpression
 * @example
 * new RegExp("...");
 */
function validateNode(node) {
  return [
    isRegexConstructor(node) && node.arguments.length > 0
  ];
}

function main(node, options) {
  const { analysis } = options;

  const arg = node.arguments[0];
  const pattern = isLiteralRegex(arg) ? arg.regex.pattern : arg.value;

  // We use the safe-regex package to detect whether or not regex is safe!
  if (!safeRegex(pattern)) {
    analysis.addWarning("unsafe-regex", pattern, node.loc);
  }
}

function isRegexConstructor(node) {
  if (node.type !== "NewExpression" || node.callee.type !== "Identifier") {
    return false;
  }

  return node.callee.name === "RegExp";
}

export default {
  name: "isRegexObject",
  validateNode, main, breakOnMatch: false
};
