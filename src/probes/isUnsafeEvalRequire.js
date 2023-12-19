// Import Internal Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

/**
 * @description Detect unsafe import
 * @example
 * const stream = eval('require')('stream');
 */
function validateNode(node) {
  const identifier = getCallExpressionIdentifier(node);

  const isUnsafe = (identifier &&
    identifier === "eval" &&
    node.arguments.at(0).value === "stream");

  return [
    isUnsafe,
    isUnsafe && node.arguments.at(0).value
  ];
}

function main(node, options) {
  const { analysis, data: calleeName } = options;

  analysis.addWarning("unsafe-import", calleeName, node.loc);

  return Symbol.for("breakWalk");
}

export default {
  name: "isUnsafeImport",
  validateNode,
  main,
  breakOnMatch: false
};
