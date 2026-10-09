// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { defineProbe } from "../defineProbe.ts";
import { SourceFile } from "../SourceFile.ts";
import { isStringLiteral, type Literal } from "../estree/types.ts";

/**
 * @description Search for ESM Export
 *
 * @example
 * export { bar } from "./foo.js";
 * export * from "./bar.js";
 */
function validateNode(
  node: ESTree.ExportNamedDeclaration | ESTree.ExportAllDeclaration
): [boolean, any?] {
  return [isStringLiteral(node.source)];
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

export default defineProbe({
  name: "isESMExport",
  nodeTypes: ["ExportNamedDeclaration", "ExportAllDeclaration"],
  validateNode,
  main,
  breakOnMatch: true
});
