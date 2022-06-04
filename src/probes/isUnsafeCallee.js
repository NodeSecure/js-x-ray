// Require Internal Dependencies
import { isUnsafeCallee } from "../utils.js";
import { warnings } from "../constants.js";

/**
 * @description Detect unsafe statement
 * @example
 * eval("this");
 * Function("return this")();
 */
function validateNode(node) {
  return isUnsafeCallee(node);
}

function main(node, options) {
  const { analysis, data: calleeName } = options;

  analysis.addWarning(warnings.unsafeStmt, calleeName, node.loc);
}

export default {
  name: "isUnsafeCallee",
  validateNode, main, breakOnMatch: false
};
