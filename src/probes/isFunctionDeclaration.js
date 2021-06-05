function validateNode(node) {
  return [
    node.type === "FunctionDeclaration"
  ];
}

function main(node, options) {
  const { analysis } = options;

  if (node.id === null || node.id.type !== "Identifier") {
    return;
  }
  analysis.idtypes.functionDeclaration++;
  analysis.identifiersName.push({ name: node.id.name, type: "functionDeclaration" });
}

export default {
  name: "isFunctionDeclaration",
  validateNode, main, breakOnMatch: false
};
