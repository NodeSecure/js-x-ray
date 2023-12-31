// Import Third-party Dependencies
import {
  getVariableDeclarationIdentifiers
} from "@nodesecure/estree-ast-utils";

// In case we are matching a Variable declaration, we have to save the identifier
// This allow the AST Analysis to retrieve required dependency when the stmt is mixed with variables.
function validateNode(node) {
  return [
    node.type === "VariableDeclaration"
  ];
}

function main(mainNode, options) {
  const { analysis } = options;

  analysis.varkinds[mainNode.kind]++;

  for (const node of mainNode.declarations) {
    analysis.idtypes.variableDeclarator++;
    for (const { name } of getVariableDeclarationIdentifiers(node.id)) {
      analysis.identifiersName.push({ name, type: "variableDeclarator" });
    }
  }
}

export default {
  name: "isVariableDeclaration",
  validateNode,
  main,
  breakOnMatch: false
};
