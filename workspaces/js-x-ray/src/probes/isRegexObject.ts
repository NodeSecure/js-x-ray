// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.ts";
import type { Literal, RegExpLiteral } from "../estree/types.ts";
import { reportUnsafeRegex } from "./unsafeRegex.ts";

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

  reportUnsafeRegex(sourceFile, pattern, node.loc);
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
  nodeTypes: ["NewExpression"],
  validateNode,
  main,
  breakOnMatch: false
};
