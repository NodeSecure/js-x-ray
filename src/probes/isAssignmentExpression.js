// Import Internal Dependencies
import { getIdName } from "../utils.js";

/**
 * @description Search for AssignmentExpression (Not to be confused with AssignmentPattern).
 *
 * @see https://github.com/estree/estree/blob/master/es5.md#assignmentexpression
 * @example
 * (foo = 5)
 */
function validateNode(node) {
  return [
    node.type === "AssignmentExpression"
  ];
}

function main(node, options) {
  const { analysis } = options;

  analysis.idtypes.assignExpr++;
  for (const name of getIdName(node.left)) {
    analysis.identifiersName.push({ name, type: "assignExpr" });
  }
}

export default {
  name: "isAssignmentExpression",
  validateNode, main, breakOnMatch: false
};
