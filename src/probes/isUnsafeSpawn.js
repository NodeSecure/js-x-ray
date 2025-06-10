// Import Internal Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import { ProbeSignals } from "../ProbeRunner.js";

const kUnsafeCommands = ["csrutil"]

function isUnsafeCommand(command) {
  return kUnsafeCommands.filter(unsafeCommand => command.includes(unsafeCommand));
}

/**
 * @description Detect spawn commands containing csrutil
 * @example
 * child_process.spawn("csrutil", ["status"]);
 * require("child_process").spawn("csrutil", ["disable"]);
 * const { spawn } = require("child_process");
 * spawn("csrutil", ["status"]);
 */
function validateNode(node, { tracer }) {
  if (node.type !== "CallExpression" || node.arguments.length === 0) {
    return [false];
  }

  // Direct: child_process.spawn(...) or require("child_process").spawn(...)
  if (
    node.callee.type === "MemberExpression" &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === "spawn"
  ) {
    // child_process.spawn(...)
    if (
      node.callee.object.type === "Identifier" &&
      node.callee.object.name === "child_process"
    ) {
      return [true];
    }
    // require("child_process").spawn(...)
    if (
      node.callee.object.type === "CallExpression" &&
      node.callee.object.callee.type === "Identifier" &&
      node.callee.object.callee.name === "require" &&
      node.callee.object.arguments.length === 1 &&
      node.callee.object.arguments[0].type === "Literal" &&
      node.callee.object.arguments[0].value === "child_process"
    ) {
      return [true];
    }
  }

  return [false];
}

function main(node, options) {
  const { sourceFile } = options;

  const commandArg = node.arguments[0];
  if (!commandArg || commandArg.type !== "Literal") {
    return null;
  }

  const command = commandArg.value;
  if (typeof command === "string" && isUnsafeCommand(command)) {
    sourceFile.addWarning("unsafe-spawn", command, node.loc);
    return ProbeSignals.Skip;
  }

  return null;
}

export default {
  name: "isUnsafeSpwan",
  validateNode,
  main
};
