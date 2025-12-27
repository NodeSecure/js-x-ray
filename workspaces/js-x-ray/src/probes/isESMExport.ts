// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.ts";
import type { Literal } from "../types/estree.ts";

/**
 * @description Search for ESM Export
 *
 * @example
 * export { bar } from "./foo.js";
 * export * from "./bar.js";
 */
function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  if (
    node.type !== "ExportNamedDeclaration" &&
    node.type !== "ExportAllDeclaration"
  ) {
    return [false];
  }

  return [
    node.source !== null &&
    node.source.type === "Literal" &&
    typeof node.source.value === "string"
  ];
}

function main(
  node: (
    | ESTree.ExportNamedDeclaration
    | ESTree.ExportAllDeclaration
  ) & { source: Literal<string>; },
  { sourceFile }: { sourceFile: SourceFile; }
) {
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
