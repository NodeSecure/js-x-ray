// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { defineProbe } from "../defineProbe.ts";
import { getMemberExpressionIdentifier, isMemberExpression } from "../estree/index.ts";
import { SourceFile } from "../SourceFile.ts";
import { generateWarning } from "../warnings.ts";

function validateNode(
  node: ESTree.Literal | ESTree.MemberExpression
): [boolean, string?] {
  if (node.type === "Literal" && node.value === "__proto__") {
    return [true, "literal"];
  }

  if (isMemberExpression(node)) {
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

export default defineProbe({
  name: "isPrototypePollution",
  nodeTypes: ["Literal", "MemberExpression"],
  validateNode,
  main,
  breakOnMatch: false
});
