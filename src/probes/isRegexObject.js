// Import Third-party Dependencies
import { getMemberExpressionIdentifier, isLiteralRegex } from "@nodesecure/estree-ast-utils";
import safeRegex from "safe-regex";

/**
 * @description Search for Regex Object constructor.
 * @see https://github.com/estree/estree/blob/master/es5.md#newexpression
 * @example
 * new RegExp("...");
 */
function validateNode(node, { tracer }) {
  return [
    isRegexConstructor(node, tracer) && node.arguments.length > 0
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

function isRegexConstructor(node, tracer) {
  if (node.type !== "NewExpression") {
    return false;
  }

  let name = "";
  if (node.callee.type === "Identifier") {
    name = node.callee.name;
  }
  else {
    name = [...getMemberExpressionIdentifier(node.callee)].join(".");
  }

  if (name === "RegExp") {
    return true;
  }

  const data = tracer.getDataFromIdentifier(name);


  return data?.superClassMemory.includes("RegExp");
}

export default {
  name: "isRegexObject",
  validateNode,
  main,
  breakOnMatch: false
};
