/**
 * @description Search for UnaryExpression AST Node
 * @see https://github.com/estree/estree/blob/master/es5.md#unaryexpression
 * @example
 * -2
 */
function validateNode(node) {
  return [
    node.type === "UnaryExpression"
  ];
}

function main(node, options) {
  const { sourceFile } = options;

  // Example: !![]
  // See: https://docs.google.com/document/d/11ZrfW0bDQ-kd7Gr_Ixqyk8p3TGvxckmhFH3Z8dFoPhY/edit#
  if (node.argument.type === "UnaryExpression" && node.argument.argument.type === "ArrayExpression") {
    sourceFile.counter.doubleUnaryArray++;
  }
}

export default {
  name: "isUnaryExpression",
  validateNode,
  main,
  breakOnMatch: false
};
