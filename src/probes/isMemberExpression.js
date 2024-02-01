function validateNode(node) {
  return [
    node.type === "MemberExpression"
  ];
}

function main(node, options) {
  const { sourceFile } = options;

  sourceFile.counter[node.computed ? "computedMemberExpr" : "memberExpr"]++;
}

export default {
  name: "isMemberExpression",
  validateNode,
  main,
  breakOnMatch: true,
  breakGroup: "import"
};
