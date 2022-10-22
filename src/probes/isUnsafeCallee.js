// Import Internal Dependencies
import { isUnsafeCallee } from "../utils.js";

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

  analysis.addWarning("unsafe-stmt", calleeName, node.loc);

  return Symbol.for("skipWalk");
}

export default {
  name: "isUnsafeCallee",
  validateNode, main, breakOnMatch: false
};
