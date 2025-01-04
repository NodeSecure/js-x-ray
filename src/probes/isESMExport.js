/**
 * @description Search for ESM Export
 *
 * @example
 * export { bar } from "./foo.js";
 * export * from "./bar.js";
 */
function validateNode(node) {
  return [
    /**
     * We must be sure that the source property is a Literal to not fall in a trap
     * export const foo = "bar";
     */
    (node.type === "ExportNamedDeclaration" && node.source?.type === "Literal") ||
    node.type === "ExportAllDeclaration"
  ];
}

function main(node, { sourceFile }) {
  sourceFile.addDependency(
    node.source.value,
    node.loc
  );
}

export default {
  name: "isESMExport",
  validateNode,
  main,
  breakOnMatch: true
};
