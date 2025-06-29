// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";

function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  const id = getCallExpressionIdentifier(node);

  return [id === "fetch"];
}

function main(
  _node: ESTree.Node,
  { sourceFile }: { sourceFile: SourceFile; }
) {
  sourceFile.flags.add("fetch");
}

export default {
  name: "isFetch",
  validateNode,
  main,
  breakOnMatch: false
};
