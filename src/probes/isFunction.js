// Import Internal Dependencies
import { extractNode } from "../utils.js";

// CONSTANTS
const kIdExtractor = extractNode("Identifier");

/**
 * @description Search for FunctionDeclaration AST Node.
 *
 * @see https://github.com/estree/estree/blob/master/es5.md#functiondeclaration
 * @example
 * function foo() {}
 */
function validateNode(node) {
  return [
    node.type === "FunctionDeclaration" || node.type === "FunctionExpression"
  ];
}

function main(node, options) {
  const { analysis } = options;

  kIdExtractor(
    ({ name }) => analysis.identifiersName.push({ name, type: "params" }),
    node.params
  );

  if (node.id === null || node.id.type !== "Identifier") {
    return;
  }
  analysis.idtypes.functionDeclaration++;
  analysis.identifiersName.push({ name: node.id.name, type: "functionDeclaration" });
}

export default {
  name: "isFunctionDeclaration",
  validateNode,
  main,
  breakOnMatch: false
};
