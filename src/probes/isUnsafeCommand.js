// Import Internal Dependencies
import { ProbeSignals } from "../ProbeRunner.js";

const kUnsafeCommands = ["csrutil"];

function isUnsafeCommand(command) {
  return Boolean(kUnsafeCommands.find((unsafeCommand) => command.includes(unsafeCommand)));
}

/**
 * @description Detect spawn or exec unsafe commands
 * @example
 * child_process.spawn("csrutil", ["status"]);
 *
 * require("child_process").spawn("csrutil", ["disable"]);
 *
 * const { exec } = require("child_process");
 * exec("csrutil status");
 */
function validateNode(node) {
  if (node.type !== "CallExpression" || node.arguments.length === 0) {
    return [false];
  }

  // const { spawn } = require("child_process");
  // spawn("...", ["..."]);
  // or
  // const { exec } = require("child_process");
  // exec(...);
  if (node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    (node.callee.name === "spawn" || node.callee.name === "exec")
  ) {
    return [true];
  }

  // child_process.spawn(...) or require("child_process").spawn(...)
  // child_process.exec(...) or require("child_process").exec(...)
  if (
    node.callee.type === "MemberExpression" &&
    node.callee.property.type === "Identifier" &&
    (node.callee.property.name === "spawn" || node.callee.property.name === "exec")
  ) {
    // child_process.spawn(...)
    // child_process.exec(...)
    if (
      node.callee.object.type === "Identifier" &&
      node.callee.object.name === "child_process"
    ) {
      return [true];
    }
    // require("child_process").spawn(...)
    // require("child_process").exec(...)
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
    sourceFile.addWarning("unsafe-command", command, node.loc);

    return ProbeSignals.Skip;
  }

  return null;
}

export default {
  name: "isUnsafeCommand",
  validateNode,
  main
};
