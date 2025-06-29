// Import Third-party Dependencies
import safeRegex from "safe-regex";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";
import { generateWarning } from "../warnings.js";
import type { Literal, RegExpLiteral } from "../types/estree.js";

/**
 * @description Search for Regex Object constructor.
 * @see https://github.com/estree/estree/blob/master/es5.md#newexpression
 * @example
 * new RegExp("...");
 */
function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  return [
    isRegexConstructor(node) && node.arguments.length > 0
  ];
}

function main(
  node: ESTree.NewExpression & {
    callee: ESTree.Identifier;
  },
  options: { sourceFile: SourceFile; }
) {
  const { sourceFile } = options;

  const arg = node.arguments.at(0) as Literal<string> | RegExpLiteral<string>;
  if (!arg) {
    return;
  }

  /**
   * Note: RegExp Object can contain a RegExpLiteral
   * @see https://github.com/estree/estree/blob/master/es5.md#regexpliteral
   *
   * @example
   * new RegExp(/^foo/)
   */
  const pattern = arg.type === "Literal" && "regex" in arg ?
    arg.regex.pattern :
    arg.value;

  // We use the safe-regex package to detect whether or not regex is safe!
  if (!safeRegex(pattern)) {
    sourceFile.warnings.push(
      generateWarning("unsafe-regex", { value: pattern, location: node.loc })
    );
  }
}

function isRegexConstructor(
  node: ESTree.Node
): node is ESTree.NewExpression {
  if (node.type !== "NewExpression" || node.callee.type !== "Identifier") {
    return false;
  }

  return node.callee.name === "RegExp";
}

export default {
  name: "isRegexObject",
  validateNode,
  main,
  breakOnMatch: false
};
