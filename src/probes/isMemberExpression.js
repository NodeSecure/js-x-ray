function validateNode(node) {
  return [
    node.type === "MemberExpression"
  ];
}

function main(node, options) {
  const { analysis } = options;

  analysis.counter[node.computed ? "computedMemberExpr" : "memberExpr"]++;
}

export default {
  name: "isMemberExpression",
  validateNode, main, breakOnMatch: true, breakGroup: "import"
};
