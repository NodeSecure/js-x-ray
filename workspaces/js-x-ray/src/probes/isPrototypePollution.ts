// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "../estree/index.ts";
import { SourceFile } from "../SourceFile.ts";
import { generateWarning } from "../warnings.ts";

function validateNode(
  node: ESTree.Node
): [boolean, string?] {
  if (node.type === "Literal" && node.value === "__proto__") {
    return [true, "literal"];
  }

  if (node.type === "MemberExpression") {
    const parts = [...getMemberExpressionIdentifier(node)];

    if (parts.at(-1) === "__proto__") {
      return [true, parts.join(".")];
    }
  }

  return [false];
}

function main(
  node: ESTree.Literal | ESTree.MemberExpression,
  options: {
    sourceFile: SourceFile;
    data?: string;
    signals: { Skip: symbol; };
  }
) {
  const { sourceFile, data, signals } = options;

  sourceFile.warnings.push(
    generateWarning("prototype-pollution", {
      value: data === "literal" ? "__proto__" : data!,
      location: node.loc ?? null
    })
  );

  return data === "literal" ? undefined : signals.Skip;
}

export default {
  name: "isPrototypePollution",
  validateNode,
  main,
  breakOnMatch: false
};
