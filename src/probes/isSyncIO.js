// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

// Constants
const kTracedNodeCoreModules = ["fs", "crypto", "child_process", "zlib"];

function validateNode(node, { tracer }) {
  const id = getCallExpressionIdentifier(node, { tracer });
  if (id === null || !kTracedNodeCoreModules.some((moduleName) => tracer.importedModules.has(moduleName))) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [data !== null && data.identifierOrMemberExpr.endsWith("Sync")];
}

function main(node, { sourceFile }) {
  sourceFile.addWarning("synchronous-io", node.callee.name, node.loc);
}

export default {
  name: "isSyncIO",
  validateNode,
  main,
  breakOnMatch: false
};
