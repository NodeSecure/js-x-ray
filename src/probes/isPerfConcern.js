// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

// Constants
const kModules = ["fs", "crypto", "child_process", "zlib"];

function validateNode(node, { tracer }) {
  const id = getCallExpressionIdentifier(node, { tracer });
  if (id === null || !kModules.some((m) => tracer.importedModules.has(m))) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [data !== null && data.identifierOrMemberExpr.endsWith("Sync")];
}

function main(node, { sourceFile }) {
  sourceFile.addWarning("perf", node.callee.name, node.loc);
}

export default {
  name: "isPerfConcern",
  validateNode,
  main,
  breakOnMatch: false
};
