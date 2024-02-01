// Import Third-party Dependencies
import { getVariableDeclarationIdentifiers } from "@nodesecure/estree-ast-utils";

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
  const { sourceFile } = options;

  sourceFile.idtypes.assignExpr++;
  for (const { name } of getVariableDeclarationIdentifiers(node.left)) {
    sourceFile.identifiersName.push({ name, type: "assignExpr" });
  }
}

export default {
  name: "isAssignmentExpression",
  validateNode,
  main,
  breakOnMatch: false
};
