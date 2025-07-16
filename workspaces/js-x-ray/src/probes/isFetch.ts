// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.js";

function validateNode(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;
  const id = getCallExpressionIdentifier(node);

  if (id === null) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [data !== null && data.identifierOrMemberExpr === "fetch"];
}

function initialize(
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;

  sourceFile.tracer.trace("fetch", { followConsecutiveAssignment: true });
}

function main(
  _node: ESTree.Node,
  { sourceFile }: ProbeContext
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
