// Import Internal Dependencies
import { getIdName } from "../utils.js";

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
