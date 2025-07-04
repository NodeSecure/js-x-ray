// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";

function validateNode(
  node: ESTree.Node,
  { tracer }: SourceFile
): [boolean, any?] {
  const id = getCallExpressionIdentifier(node);

  if (id === null) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [data !== null && data.identifierOrMemberExpr === "fetch"];
}

function initialize(sourceFile: SourceFile) {
  sourceFile.tracer.trace("fetch", { followConsecutiveAssignment: true });
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
  initialize,
  main,
  breakOnMatch: false
};
