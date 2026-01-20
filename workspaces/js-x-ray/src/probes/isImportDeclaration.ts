// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.ts";
import type { Literal } from "../types/estree.ts";
import { generateWarning } from "../warnings.ts";

/**
 * @description Search for ESM ImportDeclaration
 * @see https://github.com/estree/estree/blob/master/es2015.md#importdeclaration
 * @example
 * import * as foo from "bar";
 * import fs from "fs";
 * import "make-promises-safe";
 */
function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  if (node.type !== "ImportDeclaration" && node.type !== "ImportExpression") {
    return [false];
  }

  // Note: the source property is the right-side Literal part of the Import
  return [
    node.source.type === "Literal" &&
    typeof node.source.value === "string"
  ];
}

function main(
  node: (
    | ESTree.ImportDeclaration
    | ESTree.ImportExpression
  ) & { source: Literal<string>; },
  options: { sourceFile: SourceFile; }
) {
  const { sourceFile } = options;

  if ([
    // Searching for dangerous import "data:text/javascript;..." statement.
    // see: https://2ality.com/2019/10/eval-via-import.html
    "data:text/javascript",
    // Searching for dangerous import "file:..." statement
    // see: https://en.wikipedia.org/wiki/File_inclusion_vulnerability
    "file:"
  ].some((suspiciousPath) => node.source.value.startsWith(suspiciousPath))) {
    sourceFile.warnings.push(
      generateWarning(
        "unsafe-import", { value: node.source.value, location: node.loc }
      )
    );
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
