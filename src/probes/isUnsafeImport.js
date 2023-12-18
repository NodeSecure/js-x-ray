// Import Internal Dependencies
import { isUnsafeConstEvalRequireImport } from "../utils.js";

/**
 * @description Detect unsafe import
 * @example
 * const stream = eval('require')('stream');
 */
function validateNode(node) {
  return isUnsafeConstEvalRequireImport(node);
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
