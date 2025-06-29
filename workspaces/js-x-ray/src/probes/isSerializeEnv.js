// Import Third-party Dependencies
import { getCallExpressionIdentifier, getMemberExpressionIdentifier } from "@nodesecure/estree-ast-utils";

// Import Internal Dependencies
import { ProbeSignals } from "../ProbeRunner.js";

/**
 * @description Detect serialization of process.env which could indicate environment variable exfiltration
 * @example
 * JSON.stringify(process.env)
 * JSON.stringify(process["env"])
 * JSON.stringify(process["env"])
 * JSON.stringify(process[`env`])
 */
function validateNode(node) {
  const id = getCallExpressionIdentifier(node);
  if (id !== "JSON.stringify") {
    return [false];
  }

  if (node.arguments.length === 0) {
    return [false];
  }

  const firstArg = node.arguments[0];

  if (firstArg.type === "MemberExpression") {
    const memberExprId = [...getMemberExpressionIdentifier(firstArg)].join(".");
    if (memberExprId === "process.env") {
      return [true, "serialize-environment"];
    }
  }

  return [false];
}

function main(node, options) {
  const { sourceFile, data: warningType } = options;

  sourceFile.addWarning(warningType, "JSON.stringify(process.env)", node.loc);

  return ProbeSignals.Skip;
}

export default {
  name: "isSerializeEnv",
  validateNode,
  main,
  breakOnMatch: false
};
