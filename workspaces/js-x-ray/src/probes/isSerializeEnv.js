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
  if (node.type !== "CallExpression") {
    return [false];
  }

  if (
    node.callee.type !== "MemberExpression" ||
    node.callee.object.name !== "JSON" ||
    node.callee.property.name !== "stringify"
  ) {
    return [false];
  }

  if (node.arguments.length === 0) {
    return [false];
  }

  const firstArg = node.arguments[0];

  if (
    firstArg.type === "MemberExpression" &&
    firstArg.object.name === "process" &&
    (
      // Check for process.env
      (firstArg.property.type === "Identifier" && firstArg.property.name === "env") ||
      // Check for process["env"] or process["env"] or process[`env`]
      (firstArg.property.type === "Literal" && firstArg.property.value === "env")
    )
  ) {
    return [true, "serialize-environment"];
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
