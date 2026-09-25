// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeMainContext } from "../ProbeRunner.ts";
import { isStringLiteral } from "../estree/types.ts";
import { generateWarning } from "../warnings.ts";

/**
 * @description Search for ESM ImportDeclaration
 * @see https://github.com/estree/estree/blob/master/es2015.md#importdeclaration
 * @example
 * import * as foo from "bar";
 * import fs from "fs";
 * import "make-promises-safe";
 * import(`bar`);
 */
function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  if (node.type !== "ImportDeclaration" && node.type !== "ImportExpression") {
    return [false];
  }

  // Note: the source property is the right-side part of the Import
  const specifier = getSpecifier(node.source);

  return [specifier !== null, specifier];
}

function getSpecifier(
  source: ESTree.Node
): string | null {
  if (isStringLiteral(source)) {
    return source.value;
  }

  // import(`bar`) is the same specifier as import("bar")
  if (source.type === "TemplateLiteral" && source.expressions.length === 0) {
    return source.quasis[0].value.cooked;
  }

  return null;
}

function main(
  node: ESTree.ImportDeclaration | ESTree.ImportExpression,
  ctx: ProbeMainContext
) {
  const { sourceFile, data: specifier } = ctx;

  if ([
    // Searching for dangerous import "data:text/javascript;..." statement.
    // see: https://2ality.com/2019/10/eval-via-import.html
    "data:text/javascript",
    // Searching for dangerous import "file:..." statement
    // see: https://en.wikipedia.org/wiki/File_inclusion_vulnerability
    "file:"
  ].some((suspiciousPath) => specifier.startsWith(suspiciousPath))) {
    sourceFile.warnings.push(
      generateWarning(
        "unsafe-import", { value: specifier, location: node.loc }
      )
    );
  }
  sourceFile.addDependency(specifier, node.loc);
}

export default {
  name: "isImportDeclaration",
  nodeTypes: ["ImportDeclaration", "ImportExpression"],
  validateNode,
  main,
  breakOnMatch: true,
  breakGroup: "import"
};
