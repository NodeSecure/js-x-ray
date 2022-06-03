/**
 * @description Search for ObjectExpression AST Node (commonly known as Object).
 * @see https://github.com/estree/estree/blob/master/es5.md#objectexpression
 * @example
 * { foo: "bar" }
 */
function validateNode(node) {
  return [
    node.type === "ObjectExpression"
  ];
}

function main(node, options) {
  const { analysis } = options;

  for (const property of node.properties) {
    if (property.type !== "Property" || property.key.type !== "Identifier") {
      continue;
    }

    analysis.idtypes.property++;
    analysis.identifiersName.push({ name: property.key.name, type: "property" });
  }
}

export default {
  name: "isObjectExpression",
  validateNode, main, breakOnMatch: false
};
