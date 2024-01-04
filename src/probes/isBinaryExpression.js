/**
 * @description Search for BinaryExpression AST Node.
 *
 * @see https://github.com/estree/estree/blob/master/es5.md#binaryexpression
 * @example
 * 5 + 5 + 10
 */
function validateNode(node) {
  return [
    node.type === "BinaryExpression"
  ];
}

function main(node, options) {
  const { analysis } = options;

  const [binaryExprDeepness, hasUnaryExpression] = walkBinaryExpression(node);
  if (binaryExprDeepness >= 3 && hasUnaryExpression) {
    analysis.counter.deepBinaryExpr++;
  }
}

/**
 * @description Look for suspicious BinaryExpression (read the Obfuscator.io section of the linked G.Doc)
 * @see https://docs.google.com/document/d/11ZrfW0bDQ-kd7Gr_Ixqyk8p3TGvxckmhFH3Z8dFoPhY/edit?usp=sharing
 * @see https://github.com/estree/estree/blob/master/es5.md#unaryexpression
 * @example
 * 0x1*-0x12df+-0x1fb9*-0x1+0x2*-0x66d
 */
function walkBinaryExpression(expr, level = 1) {
  const [lt, rt] = [expr.left.type, expr.right.type];
  let hasUnaryExpression = lt === "UnaryExpression" || rt === "UnaryExpression";
  let currentLevel = lt === "BinaryExpression" || rt === "BinaryExpression" ? level + 1 : level;

  for (const currExpr of [expr.left, expr.right]) {
    if (currExpr.type === "BinaryExpression") {
      const [deepLevel, deepHasUnaryExpression] = walkBinaryExpression(currExpr, currentLevel);
      if (deepLevel > currentLevel) {
        currentLevel = deepLevel;
      }
      if (!hasUnaryExpression && deepHasUnaryExpression) {
        hasUnaryExpression = true;
      }
    }
  }

  return [currentLevel, hasUnaryExpression];
}

export default {
  name: "isBinaryExpression",
  validateNode,
  main,
  breakOnMatch: false
};
