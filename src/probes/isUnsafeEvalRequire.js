// Import Internal Dependencies
import {
  getCallExpressionArguments,
  getCallExpressionIdentifier
} from "@nodesecure/estree-ast-utils";

/**
 * @description Detect unsafe import
 * @example
 * const stream = eval('require')('stream');
 */
function validateNode(node) {
  const identifier = getCallExpressionIdentifier(node);
  const argument = getCallExpressionArguments(node);

  const isUnsafeEvalRequire = (
    identifier &&
    identifier === "eval" &&
    node.callee.arguments &&
    node.arguments.at(0).value &&
    node.callee.arguments.at(0).value === "require");

  return [
    isUnsafeEvalRequire,
    isUnsafeEvalRequire && argument[0]
  ];
}

function main(node, options) {
  const { analysis, data: calleeName } = options;

  analysis.addWarning("unsafe-import", calleeName, node.loc);
}

export default {
  name: "isUnsafeEvalRequire",
  validateNode,
  main,
  breakOnMatch: false
};
