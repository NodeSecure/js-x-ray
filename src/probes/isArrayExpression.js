/**
 * @description Search for ArrayExpression AST Node (Commonly known as JS Arrays)
 *
 * @see https://github.com/estree/estree/blob/master/es5.md#arrayexpression
 * @example
 * ["foo", "bar", 1]
 */
function validateNode(node) {
  return [
    node.type === "ArrayExpression"
  ];
}

function main(node, options) {
  const { analysis } = options;

  for (const elem of node.elements) {
    if (elem !== null && elem.type === "Literal") {
      analysis.analyzeLiteral(elem, true);
    }
  }
}

export default {
  name: "isArrayExpression",
  validateNode, main, breakOnMatch: false
};
