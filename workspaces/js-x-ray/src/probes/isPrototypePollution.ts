import type { ESTree } from "meriyah";
import { SourceFile } from "../SourceFile.ts";
import { generateWarning } from "../warnings.ts";

function validateNode(
  node: ESTree.Node
): [boolean, string?] {
  if (node.type === "Literal" && node.value === "__proto__") {
    return [true, "literal"];
  }

  if (node.type === "MemberExpression") {
    if (
      (node.property.type === "Identifier" && node.property.name === "__proto__" && !node.computed) ||
      (node.property.type === "Literal" && node.property.value === "__proto__")
    ) {
      return [true, "member"];
    }
  }

  return [false];
}

function main(
  node: ESTree.Literal | ESTree.MemberExpression,
  options: {
    sourceFile: SourceFile;
    data?: "literal" | "member";
    signals: { Skip: symbol };
  }
) {
  const { sourceFile, data, signals } = options;

  sourceFile.warnings.push(
    generateWarning("prototype-pollution", {
      value: data === "literal" ? "__proto__" : "obj.__proto__",
      location: node.loc ?? null
    })
  );

  return data === "member" ? signals.Skip : undefined;
}

export default {
  name: "isPrototypePollution",
  validateNode,
  main,
  breakOnMatch: false
};
