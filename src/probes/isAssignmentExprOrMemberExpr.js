// Import Internal Dependencies
import { getMemberExprName } from "../utils.js";

// Search for unsafe assignment and member expression like 'require.cache'
function validateNode(node) {
  return [
    node.type === "AssignmentExpression" && node.left.type === "MemberExpression"
  ];
}

function main(node, options) {
  const { analysis } = options;

  const assignName = getMemberExprName(node.left);
  if (node.right.type === "Identifier" && analysis.requireIdentifiers.has(node.right.name)) {
    analysis.requireIdentifiers.add(assignName);
  }
}

export default {
  name: "isAssignmentExprOrMemberExpr",
  validateNode, main, breakOnMatch: false
};
