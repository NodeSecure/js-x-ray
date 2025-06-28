/**
 * @description Search for ESM ImportDeclaration
 * @see https://github.com/estree/estree/blob/master/es2015.md#importdeclaration
 * @example
 * import * as foo from "bar";
 * import fs from "fs";
 * import "make-promises-safe";
 */
function validateNode(node) {
  return [
    // Note: the source property is the right-side Literal part of the Import
    ["ImportDeclaration", "ImportExpression"].includes(node.type) && node.source.type === "Literal"
  ];
}

function main(node, options) {
  const { sourceFile } = options;

  // Searching for dangerous import "data:text/javascript;..." statement.
  // see: https://2ality.com/2019/10/eval-via-import.html
  if (node.source.value.startsWith("data:text/javascript")) {
    sourceFile.addWarning("unsafe-import", node.source.value, node.loc);
  }
  sourceFile.addDependency(node.source.value, node.loc);
}

export default {
  name: "isImportDeclaration",
  validateNode,
  main,
  breakOnMatch: true,
  breakGroup: "import"
};
