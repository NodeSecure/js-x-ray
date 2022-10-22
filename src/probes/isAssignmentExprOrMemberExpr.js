// Import Third-party Dependencies
import { getMemberExpressionIdentifier } from "@nodesecure/estree-ast-utils";

// Search for unsafe assignment and member expression like 'require.cache'
function validateNode(node) {
  return [
    node.type === "AssignmentExpression" && node.left.type === "MemberExpression"
  ];
}

function main(node, options) {
  const { analysis } = options;
  const { tracer } = analysis;

  /**
   * TODO (Note)
   *
   * No test throw for this, the code probably need to be removed with the new VariableTracer
   */
  const assignName = [...getMemberExpressionIdentifier(node.left, { tracer })].join("");
  if (node.right.type === "Identifier" && analysis.requireIdentifiers.has(node.right.name)) {
    analysis.requireIdentifiers.add(assignName);
  }
}

export default {
  name: "isAssignmentExprOrMemberExpr",
  validateNode, main, breakOnMatch: false
};
